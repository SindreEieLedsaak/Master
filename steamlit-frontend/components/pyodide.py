from streamlit.components.v1 import html

def pyodide_component(code):
    """
    Create a Pyodide component that executes Python code in the browser.
    
    Args:
        code (str): Python code to execute
    
    Returns:
        streamlit component: HTML component that runs Python in the browser
    """
    component_html = f"""
    <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
        <div id="output" style="height: 200px; overflow: auto; white-space: pre-wrap; 
                               font-family: monospace; border: 1px solid #eee; padding: 10px;
                               color: white; background-color: #333;">
            Loading Pyodide (this may take a few seconds)...
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"></script>
    <script>
        async function main() {{
            const output = document.getElementById('output');
            output.textContent = 'Loading Pyodide...';
            
            try {{
                const pyodide = await loadPyodide();
                output.textContent = 'Running your code...';
                
                // Capture print statements
                pyodide.runPython(`
                    import sys
                    from io import StringIO
                    sys.stdout = StringIO()
                `);
                
                // Run the user code
                try {{
                    pyodide.runPython({repr(code)});
                    // Get the captured output
                    let stdout = pyodide.runPython("sys.stdout.getvalue()");
                    output.textContent = stdout || "Code executed successfully (no output)";
                }} catch (err) {{
                    output.textContent = 'Error: ' + err.message;
                }}
                
            }} catch (err) {{
                output.textContent = 'Failed to load Pyodide: ' + err.message;
            }}
        }}
        
        // Start Pyodide
        main();
    </script>
    """
    return html(component_html, height=250)