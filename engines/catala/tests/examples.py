import hashlib
import importlib.util
import io
import json
import os
import re
import shutil
import subprocess
import tarfile
import tempfile
from pathlib import Path, PurePosixPath

EXAMPLES = json.loads((Path(__file__).parent / "examples.json").read_text())["examples"]
ERRORS = ("ScopeError", "UnsupportedType", "ValueError")
COMMIT = re.compile(r"[0-9a-f]{40}")
LOCATION = ("package", "repository", "commit", "directory")


def check_examples(examples: list[dict]) -> None:
    """Refuse the examples that git, the import system or the tests would misread."""
    packages = [example["package"] for example in examples]
    for example in examples:
        package, repository, commit, directory = (example[field] for field in LOCATION)
        # git runs a command for some URL schemes, such as ext::
        if not repository.startswith("https://"):
            raise ValueError(f"the repository {repository!r} is not an https URL")
        if not COMMIT.fullmatch(commit):
            raise ValueError(f"the commit {commit!r} is not a full hash")
        if not package.isidentifier():
            raise ValueError(f"the package {package!r} is not a Python identifier")
        if packages.count(package) > 1:
            raise ValueError(f"the package {package!r} names two examples")
        if importlib.util.find_spec(package) is not None:
            raise ValueError(f"the package {package!r} shadows a module that is already importable")
        if PurePosixPath(directory).is_absolute() or ".." in PurePosixPath(directory).parts:
            raise ValueError(f"the directory {directory!r} leaves the repository")
        for case in example["cases"]:
            if ("output" in case) == ("error" in case):
                raise ValueError(f"the case {case['target']!r} does not give exactly one of output and error")
            if "error" in case and case["error"]["type"] not in ERRORS:
                raise ValueError(f"the case {case['target']!r} expects an unknown error {case['error']['type']!r}")


def git(*args: str, cwd: str) -> bytes:
    # with GIT_TERMINAL_PROMPT=0, git fails at once on a repository that asks for credentials
    environment = {**os.environ, "GIT_TERMINAL_PROMPT": "0"}
    return subprocess.run(["git", *args], cwd=cwd, env=environment, check=True, capture_output=True).stdout


def download(example: dict, root: Path) -> Path:
    """Extract the directory of an example at its commit as its package, and return the folder to import it from.

    The name of the folder changes with the location of the example: a folder that exists is complete for this version
    of `download`.
    """
    folder = root / hashlib.sha256("\n".join(example[field] for field in LOCATION).encode()).hexdigest()[:16]
    if folder.exists():
        return folder
    partial = Path(tempfile.mkdtemp(dir=root))
    try:
        with tempfile.TemporaryDirectory() as repository:
            git("init", "--quiet", cwd=repository)
            git("fetch", "--quiet", "--depth", "1", example["repository"], example["commit"], cwd=repository)
            archive = git("archive", f"--prefix={example['package']}/", f"FETCH_HEAD:{example['directory']}", cwd=repository)
        with tarfile.open(fileobj=io.BytesIO(archive)) as tar:
            # the archive holds the files of another repository: links and paths out of the folder are refused
            tar.extractall(partial, filter="data")
        try:
            partial.rename(folder)
        except OSError:
            # another session of pytest renamed its own download first
            if not folder.exists():
                raise
    except (subprocess.CalledProcessError, OSError, tarfile.TarError) as error:
        reason = error.stderr.decode().strip() if isinstance(error, subprocess.CalledProcessError) else error
        location = f"{example['directory']} of {example['repository']} at the commit {example['commit']}"
        raise RuntimeError(f"could not get {location}: {reason}") from error
    finally:
        shutil.rmtree(partial, ignore_errors=True)
    return folder
