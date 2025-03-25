import streamlit as st
import json

def get_file_contents(files):
    """
    Get the contents of all files concatenated with file headers
    
    Args:
        files (dict): Dictionary with filename:content pairs
    
    Returns:
        str: Concatenated file contents with headers
    """
    return "\n\n".join([f"# FILE: {filename}\n{content}" 
                      for filename, content in files.items()])

def get_current_files():
    """Get the current files from session state"""
    if 'files' not in st.session_state:
        st.session_state.files = {
            "main.py": "# Write your main code here\nprint('Hello, world!')",
            "module.py": "# A module you can import\n\ndef greet(name):\n    return f'Hello, {name}!'"
        }
    return st.session_state.files

def save_file(filename, content):
    """Save content to a file in the session state"""
    files = get_current_files()
    files[filename] = content
    st.session_state.files = files

def delete_file(filename):
    """Delete a file from the session state"""
    files = get_current_files()
    if filename in files:
        del files[filename]
        st.session_state.files = files

def multi_file_editor(initial_files=None):
    """
    Create a multi-file editor using Streamlit
    
    Args:
        initial_files (dict): Dictionary with filename:content pairs
    """
    # Only initialize files if not already in session_state
    if "files" not in st.session_state:
        if initial_files is not None:
            st.session_state.files = initial_files
        else:
            st.session_state.files = {}  # or provide a default

    files = get_current_files()  # This should now reflect session_state.files

    # Create tabs for files
    if 'active_file' not in st.session_state or st.session_state.active_file not in files:
        st.session_state.active_file = list(files.keys())[0] if files else "main.py"

    # File management section
    col1, col2 = st.columns([3, 1])
    
    with col1:
        tabs = st.tabs(list(files.keys()))
        
        # Show the active file's content in the current tab
        for i, (filename, content) in enumerate(files.items()):
            with tabs[i]:
                new_content = st.text_area(
                    f"Editing {filename}", 
                    value=content,
                    height=400,
                    key=f"editor_{filename}"
                )
                if new_content != content:
                    save_file(filename, new_content)
    
    with col2:
        st.subheader("File Operations")
        
        # New file creation
        new_filename = st.text_input("New file name", key="new_file_name")
        if st.button("Create File"):
            if new_filename and new_filename not in files:
                save_file(new_filename, f"# New file: {new_filename}\n")
                # Set the new file as active
                st.session_state.active_file = new_filename
                st.rerun()
        
        # File deletion
        if len(files) > 1:  # Prevent deleting the last file
            file_to_delete = st.selectbox("Select file to delete", list(files.keys()))
            if st.button("Delete File"):
                # If deleting the active file, set a new active file
                if file_to_delete == st.session_state.active_file:
                    remaining_files = [f for f in files.keys() if f != file_to_delete]
                    st.session_state.active_file = remaining_files[0] if remaining_files else "main.py"
                
                delete_file(file_to_delete)
                st.rerun()

    
    # Add Pyodide execution component
    st.subheader("Code Execution")
    if st.button("Run in Browser (Pyodide)"):
        pyodide_runner(files)

def pyodide_runner(files):
    """Run the code using Pyodide"""
    # Convert files to JSON for JavaScript
    files_json = json.dumps(files)
    active_file = st.session_state.active_file
    
    # Create the Pyodide component
    st.components.v1.html(
        f"""
        <div id="output" style="white-space: pre-wrap; font-family: monospace; 
                               height: 200px; overflow: auto; border: 1px solid #ccc; 
                               padding: 10px; background: #f8f8f8;">
            Loading Pyodide...
        </div>
        
        <script src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"></script>
        <script>
            const output = document.getElementById('output');
            const files = {files_json};
            const activeFile = "{active_file}";
            
            async function runPython() {{
                output.textContent = 'Loading Pyodide (this may take a few seconds)...';
                
                try {{
                    // Initialize Pyodide
                    const pyodide = await loadPyodide();
                    output.textContent = 'Running your code...';
                    
                    // Set up stdout capture
                    pyodide.runPython(`
                        import sys
                        from io import StringIO
                        sys.stdout = StringIO()
                        sys.stderr = StringIO()
                    `);
                    
                    // Write files to Pyodide filesystem
                    for (const [filename, content] of Object.entries(files)) {{
                        pyodide.globals.set("_filename", filename);
                        pyodide.globals.set("_content", content);
                        pyodide.runPython(`
                            with open(_filename, "w") as f:
                                f.write(_content)
                        `);
                    }}
                    
                    // Add current directory to path and run the active file
                    pyodide.globals.set("active_file", activeFile);
                    pyodide.runPython(`
                        try:
                            import sys
                            if '.' not in sys.path:
                                sys.path.append('.')
                                
                            with open(active_file) as f:
                                exec(f.read())
                                
                        except Exception as e:
                            import traceback
                            sys.stderr.write(traceback.format_exc())
                    `);
                    
                    // Get output and display
                    const stdout = pyodide.runPython("sys.stdout.getvalue()");
                    const stderr = pyodide.runPython("sys.stderr.getvalue()");
                    
                    if (stderr) {{
                        output.textContent = 'Error:\\n' + stderr;
                    }} else {{
                        output.textContent = stdout || "Code executed successfully (no output)";
                    }}
                    
                }} catch (err) {{
                    output.textContent = 'Error: ' + err.message;
                }}
            }}
            
            // Run the code immediately
            runPython();
        </script>
        """,
        height=250
    )