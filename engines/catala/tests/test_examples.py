import pytest
from examples import check_examples

CASE = {"target": "example.rules:scope", "inputs": {}}
ERROR = {"type": "ValueError", "match": "missing"}
EXAMPLE = {
    "package": "example",
    "repository": "https://example.org/administration/rules",
    "commit": "0" * 40,
    "directory": "compiled",
    "cases": [{**CASE, "output": {}}],
}
REFUSED = [
    ("is not an https URL", {"repository": "ext::sh -c id"}),
    ("is not a full hash", {"commit": "03bbdaa"}),
    ("is not a Python identifier", {"package": "../example"}),
    ("shadows a module", {"package": "pytest"}),
    ("leaves the repository", {"directory": "/etc"}),
    ("leaves the repository", {"directory": "compiled/../.."}),
    ("exactly one of output and error", {"cases": [CASE]}),
    ("exactly one of output and error", {"cases": [{**CASE, "output": {}, "error": ERROR}]}),
    ("expects an unknown error", {"cases": [{**CASE, "error": {**ERROR, "type": "KeyError"}}]}),
]


@pytest.mark.parametrize(("message", "change"), REFUSED, ids=[message for message, _ in REFUSED])
def test_a_malformed_example_is_refused(message, change):
    with pytest.raises(ValueError, match=message):
        check_examples([{**EXAMPLE, **change}])


def test_a_package_that_names_two_examples_is_refused():
    with pytest.raises(ValueError, match="names two examples"):
        check_examples([EXAMPLE, EXAMPLE])
