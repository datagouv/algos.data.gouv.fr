import json
from pathlib import Path

from contract.samples import sample_input_errors
from contract.samples import validate_samples

PATH = 'record.json'


def write_record(tmp_path, content):
    """Écrit une fiche dans un fichier temporaire et retourne son chemin."""
    path = tmp_path / PATH
    path.write_text(json.dumps(content), encoding='utf-8')
    return path


def problems_of(problems):
    """Retourne les messages d'une liste de problèmes, sans les chemins."""
    return [message for _, message in problems]


def test_reports_an_applied_schema_and_a_sample_that_both_break(tmp_path):
    path = write_record(tmp_path, {'input_schema': {'type': 'objet'}, 'sample_input': {'age': 42}})
    messages = problems_of(validate_samples(path))
    assert messages[0] == "a un input_schema invalide : 'objet' is not valid under any of the given schemas"
    assert messages[1].startswith("a un input_schema que le validateur ne sait pas appliquer : Unknown type 'objet'")


# sample_input_errors vérifie l'exemple contre le schéma, trié par le chemin du problème

def test_skips_the_sample_when_the_record_gives_none():
    assert sample_input_errors(Path(PATH), {'type': 'object'}, None) == []


def test_sorts_the_problems_by_the_path_of_the_sample():
    input_schema = {
        'type': 'object',
        'properties': {'ville': {'type': 'string'}, 'age': {'type': 'integer'}},
    }
    problems = sample_input_errors(Path(PATH), input_schema, {'age': 'x', 'ville': 15})
    assert problems_of(problems) == [
        "a un exemple d'entrées à $.age qui ne respecte pas input_schema : 'x' is not of type 'integer'",
        "a un exemple d'entrées à $.ville qui ne respecte pas input_schema : 15 is not of type 'string'",
    ]
