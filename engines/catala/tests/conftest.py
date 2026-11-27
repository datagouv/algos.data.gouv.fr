import pytest
from examples import EXAMPLES, check_examples, download


@pytest.fixture(scope="session")
def downloaded_examples(request):
    """Download the examples that the cache lacks and make their packages importable for the session."""
    check_examples(EXAMPLES)
    root = request.config.cache.mkdir("engine-catala-examples")
    with pytest.MonkeyPatch.context() as monkeypatch:
        for example in EXAMPLES:
            monkeypatch.syspath_prepend(download(example, root))
        yield
