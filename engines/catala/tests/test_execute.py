import builtins

import engine_catala
import pytest
from engine_catala import execute
from examples import ERRORS, EXAMPLES

CASES = [case for example in EXAMPLES for case in example["cases"]]
OUTPUTS = [case for case in CASES if "output" in case]
REFUSALS = [case for case in CASES if "error" in case]


def target_of(case: dict) -> str:
    return case["target"]


@pytest.mark.parametrize("case", OUTPUTS, ids=target_of)
def test_a_scope_gives_the_recorded_output(case, downloaded_examples):
    assert execute(case["target"], case["inputs"]) == case["output"]


@pytest.mark.parametrize("case", REFUSALS, ids=lambda case: f"{case['target']} {case['error']['type']}")
def test_a_scope_refuses_inputs_with_the_recorded_error(case, downloaded_examples):
    name, message = case["error"]["type"], case["error"]["match"]
    error = getattr(engine_catala, name, None) or getattr(builtins, name)

    with pytest.raises(error, match=message):
        execute(case["target"], case["inputs"])


def test_the_examples_keep_a_case_for_each_error():
    assert {case["error"]["type"] for case in REFUSALS} == set(ERRORS)


def test_a_target_that_is_not_module_and_function_is_refused():
    with pytest.raises(ValueError, match="module:function"):
        execute("rules.Scope", {})
