import importlib

import pytest
from engine_catala.values import from_catala, runtime_of, to_catala
from examples import EXAMPLES

MISTYPED = [
    ("Bool", "false", "expected a boolean, got str"),
    ("Bool", None, "expected a boolean, got NoneType"),
    ("Integer", 3.9, "expected an integer, got 3.9"),
    ("Integer", "3", "expected a number, got str"),
    ("Money", True, "expected a number, got bool"),
    ("Date", 20260331, "expected a date written YYYY-MM-DD, got int"),
]


@pytest.fixture
def runtime(downloaded_examples):
    module, _, _ = EXAMPLES[0]["cases"][0]["target"].partition(":")
    return runtime_of(importlib.import_module(module))


def test_a_date_goes_to_catala_and_back(runtime):
    assert from_catala(to_catala("2026-03-31", runtime.get("Date"), runtime), runtime) == "2026-03-31"


def test_an_integer_written_as_a_float_is_accepted(runtime):
    assert from_catala(to_catala(3.0, runtime.get("Integer"), runtime), runtime) == 3


@pytest.mark.parametrize(("catala_type", "value", "message"), MISTYPED)
def test_a_json_value_of_another_type_is_refused(runtime, catala_type, value, message):
    with pytest.raises(ValueError, match=message):
        to_catala(value, runtime.get(catala_type), runtime)
