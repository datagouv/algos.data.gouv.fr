# Validation croisée d'une fiche : sample_input doit respecter le schéma decrit dans input_schema.

import json
import os
import sys
from jsonschema import FormatChecker
from jsonschema.exceptions import SchemaError
from jsonschema.exceptions import UnknownType
from jsonschema.validators import validator_for
from pathlib import Path


def record_files(paths: list[str]) -> list[Path]:
    """Retourne les fiches à vérifier : celles données en argument, sinon toutes celles de data/."""
    if paths:
        return [Path(path) for path in paths]
    monorepo = os.environ.get('MISE_MONOREPO_ROOT') or Path(__file__).resolve().parents[3]
    return sorted((Path(monorepo) / 'data').glob('*/*/*.json'))


def validate_samples(path: Path) -> list[tuple[Path, str]]:
    """Retourne les problèmes de la fiche, vide quand tout est en ordre.

    Chaque problème relie un fichier à un message, prêt pour une annotation GitHub.
    """
    try:
        record = json.loads(path.read_text(encoding='utf-8'))
    except json.JSONDecodeError as error:
        return [(path, f'n\'est pas un fichier JSON valide : {error}')]
    if not isinstance(record, dict):
        return [(path, 'ne contient pas un objet')]

    input_schema = record.get('input_schema')
    sample_input = record.get('sample_input')
    if input_schema is None and sample_input is None:
        return []

    problems = []
    if input_schema is None:
        problems.append((path, 'donne un exemple d\'entrées sans input_schema, un exemple ne peut pas être vérifié'))
    elif not isinstance(input_schema, dict):
        problems.append((path, 'a un input_schema qui n\'est ni un schéma ni null'))
    else:
        problems += input_schema_errors(path, input_schema)
        problems += sample_input_errors(path, input_schema, sample_input)
    return problems


def input_schema_errors(path: Path, input_schema: dict) -> list[tuple[Path, str]]:
    """Vérifie le schéma d'entrées contre le métaschema officiel de son dialecte.

    Un schéma sans dialecte déclaré suit la convention de la fiche : le dialecte courant du registre.
    """
    if declares_an_unknown_dialect(input_schema):
        return [(path, f'déclare un dialecte de schéma inconnu : {input_schema.get("$schema")}')]
    try:
        validator_for(input_schema).check_schema(input_schema)
    except SchemaError as error:
        return [(path, f'a un input_schema invalide : {error.message}')]
    return []


def declares_an_unknown_dialect(input_schema: dict) -> bool:
    """Retourne si le schéma déclare un dialecte qu'aucun validateur ne connaît."""
    return '$schema' in input_schema and validator_for(input_schema, default=None) is None


def sample_input_errors(path: Path, input_schema: dict, sample_input: object) -> list[tuple[Path, str]]:
    """Vérifie que l'exemple d'entrées, quand la fiche en donne un, valide contre le schéma d'entrées."""
    if sample_input is None:
        return []
    if declares_an_unknown_dialect(input_schema):
        # le dialecte inconnu est déjà relaté par input_schema_errors, l'exemple ne peut qu'être passé
        return []
    validator = validator_for(input_schema)(input_schema, format_checker=FormatChecker())
    try:
        return [
            (path, f'a un exemple d\'entrées à {error.json_path} qui ne respecte pas input_schema : {error.message}')
            for error in sorted(validator.iter_errors(sample_input), key=lambda error: error.json_path)
        ]
    except UnknownType as error:
        # un schéma peut mentir sur ses types sans mentir au métaschema, que seul l'usage révèle
        return [(path, f'a un input_schema que le validateur ne sait pas appliquer : {error}')]


def main() -> int:
    problems = [problem for file in record_files(sys.argv[1:]) for problem in validate_samples(file)]
    for file, problem in problems:
        print(f'::error file={file}::{problem}')
    return 1 if problems else 0
