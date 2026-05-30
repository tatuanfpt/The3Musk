from ai.data.schema import TextRecord
from ai.preprocessing.text import normalize_text


def test_text_record_from_json_ok():
    rec = TextRecord.from_json({"id": "1", "text": "Hello"}, line_no=1)
    assert rec.id == "1"
    assert rec.text == "Hello"


def test_text_record_from_json_missing_text():
    try:
        TextRecord.from_json({"id": "1"}, line_no=3)
        assert False, "expected error"
    except ValueError as e:
        assert "Line 3" in str(e)
        assert "text" in str(e)


def test_normalize_text_collapses_whitespace():
    out = normalize_text("a   b\r\n\r\n\r\nc")
    assert out == "a b\n\nc"

