import json
import sys
from pathlib import Path

from contract.samples import main
from contract.samples import record_files
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


# validate_samples lit une fiche entière et relate ses problèmes

def test_reads_a_valid_record(tmp_path):
    record = {
        'input_schema': {'type': 'object', 'properties': {'age': {'type': 'integer'}}, 'required': ['age']},
        'sample_input': {'age': 42},
    }
    assert validate_samples(write_record(tmp_path, record)) == []


def test_skips_a_record_that_documents_neither_its_schema_nor_its_sample(tmp_path):
    assert validate_samples(write_record(tmp_path, {'input_schema': None, 'sample_input': None})) == []


def test_reports_a_file_that_is_not_json(tmp_path):
    path = tmp_path / PATH
    path.write_text('{ pas du json', encoding='utf-8')
    message = problems_of(validate_samples(path))[0]
    # le détail du message dépend de la version de Python, seul le préfixe compte
    assert message.startswith("n'est pas un fichier JSON valide : Expecting property")


def test_reports_a_file_that_contains_something_else_than_an_object(tmp_path):
    path = write_record(tmp_path, ['une', 'liste'])
    assert validate_samples(path) == [(path, 'ne contient pas un objet')]


def test_reports_a_sample_without_schema(tmp_path):
    path = write_record(tmp_path, {'input_schema': None, 'sample_input': {'age': 42}})
    assert validate_samples(path) == [
        (path, "donne un exemple d'entrées sans input_schema, un exemple ne peut pas être vérifié"),
    ]


def test_reports_a_schema_that_is_neither_a_schema_nor_null(tmp_path):
    path = write_record(tmp_path, {'input_schema': True, 'sample_input': None})
    assert validate_samples(path) == [(path, "a un input_schema qui n'est ni un schéma ni null")]


def test_reports_a_schema_that_breaks_the_metaschema_even_without_a_sample(tmp_path):
    path = write_record(tmp_path, {'input_schema': {'type': 3}, 'sample_input': None})
    message = problems_of(validate_samples(path))[0]
    assert message.startswith('a un input_schema invalide :')


def test_reports_a_schema_that_declares_an_unknown_dialect(tmp_path):
    record = {
        'input_schema': {'$schema': 'https://exemple.fr/dialecte/inconnu', 'type': 'object'},
        'sample_input': {'age': 42},
    }
    message = problems_of(validate_samples(write_record(tmp_path, record)))[0]
    assert message == 'déclare un dialecte de schéma inconnu : https://exemple.fr/dialecte/inconnu'


def test_reports_a_sample_that_breaks_its_schema(tmp_path):
    record = {
        'input_schema': {
            'type': 'object',
            'properties': {'age': {'type': 'integer'}, 'ville': {'type': 'string'}},
            'required': ['age', 'ville'],
        },
        'sample_input': {'age': 'quarante-deux'},
    }
    # les problèmes sont triés par le chemin de l'exemple : le nœud racine ($) précède sa propriété ($.age)
    assert problems_of(validate_samples(write_record(tmp_path, record))) == [
        "a un exemple d'entrées à $ qui ne respecte pas input_schema : 'ville' is a required property",
        "a un exemple d'entrées à $.age qui ne respecte pas input_schema : 'quarante-deux' is not of type 'integer'",
    ]


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


# record_files choisit les fiches à vérifier

def test_returns_the_given_paths_as_they_come():
    assert record_files(['b.json', 'a.json']) == [Path('b.json'), Path('a.json')]


def test_walks_the_records_of_the_monorepo_when_none_is_given(tmp_path, monkeypatch):
    monkeypatch.setenv('MISE_MONOREPO_ROOT', str(tmp_path))
    data = tmp_path / 'data'
    (data / 'culte' / 'pass-culture').mkdir(parents=True)
    (data / 'interieur' / 'droit-vote').mkdir(parents=True)
    (data / 'culte' / 'pass-culture' / 'fiche.json').write_text('{}', encoding='utf-8')
    (data / 'interieur' / 'droit-vote' / 'fiche.json').write_text('{}', encoding='utf-8')
    (data / 'interieur' / 'droit-vote' / 'notes.txt').write_text('', encoding='utf-8')
    assert record_files([]) == [
        data / 'culte' / 'pass-culture' / 'fiche.json',
        data / 'interieur' / 'droit-vote' / 'fiche.json',
    ]


# main vérifie les fiches et annote les problèmes pour GitHub

def test_reports_no_problem_for_the_records_of_the_repository(monkeypatch, capsys):
    monkeypatch.setattr(sys, 'argv', ['contract-samples'])
    assert main() == 0
    assert capsys.readouterr().out == ''


def test_annotates_the_problems_for_github(tmp_path, monkeypatch, capsys):
    path = write_record(tmp_path, {'input_schema': None, 'sample_input': {'age': 42}})
    monkeypatch.setattr(sys, 'argv', ['contract-samples', str(path)])
    assert main() == 1
    assert capsys.readouterr().out == (
        f"::error file={path}::donne un exemple d'entrées sans input_schema, un exemple ne peut pas être vérifié\n"
    )
