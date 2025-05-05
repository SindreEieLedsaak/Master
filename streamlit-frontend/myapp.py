import streamlit as st
from components.code_editor import multi_file_editor, get_file_contents, get_current_files
from services.ai_service import get_guidance
from services.code_service import analyze_code, run_code_server
from utils.ui_helpers import show_warning, show_code_output
from components.gitlab import gitlab_projects_component
def main():
    st.title("AI Coding Assistant for Beginners")
    st.write(
        "This tool helps you write code and provides hints, explanations, and suggestions to improve your code. "
        "It is designed to guide you without giving away complete solutions."
    )
    
    initial_files = {
        "main.py": "# Main file\nimport module\n\nresult = module.greet('Python Developer')\nprint(result)",
        "module.py": "# Helper module\n\ndef greet(name):\n    return f'Hello, {name}!'\n\nif __name__ == '__main__':\n    print('This module is being run directly')"
    }
    tab1, tab2 = st.tabs(["Code Editor", "GitLab Projects"])
    # Display multi-file editor
    st.subheader("Code Editor")
    multi_file_editor(initial_files)
    
    # Actions section
    st.subheader("AI Assistance")
    col1, col2 = st.columns(2)

    with tab1:
        # Guidance button - use all files content
        with col1:
            if st.button("Get Guidance"):
                files = get_current_files()
                all_code = get_file_contents(files)
                
                if not all_code:
                    show_warning("There is no code in the editor.")
                else:
                    with st.spinner("Processing..."):
                        guidance = get_guidance(all_code)
                    show_code_output("Assistant's Guidance:", guidance)

        # Code analysis button
        with col2:
            if st.button("Analyze Code"):
                files = get_current_files()
                main_code = files.get("main.py", "")
                
                if not main_code:
                    show_warning("There is no code in main.py to analyze.")
                else:
                    with st.spinner("Processing..."):
                        feedback = analyze_code(main_code)
                    show_code_output("Code Analysis Results:", feedback)
        
        # Server-side execution button
        if st.button("Run Code (Server)"):
            files = get_current_files()
            main_code = files.get("main.py", "")
            
            if not main_code:
                show_warning("There is no code in main.py to run.")
            else:
                with st.spinner("Processing..."):
                    output = run_code_server(main_code)
                show_code_output("Code Output (Server):", output, language="python")
    with tab2:
        # GitLab Projects component
        gitlab_projects_component()
        
if __name__ == "__main__":
    main()