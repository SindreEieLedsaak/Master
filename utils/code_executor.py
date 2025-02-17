# code_executor.py
import io
import contextlib

def run_code(code: str) -> str:
    """
    Executes the provided code and returns any output as a string.
    In case of an exception, returns the output plus an error message.
    **Caution:** Using exec is dangerous when running untrusted code.
    """
    output_buffer = io.StringIO()
    try:
        with contextlib.redirect_stdout(output_buffer):
            # Execute the code in an empty global namespace for safety.
            exec(code, {})
    except Exception as e:
        # Append the error to any captured output.
        output_buffer.write("\nError during execution: " + str(e))
    return output_buffer.getvalue()
