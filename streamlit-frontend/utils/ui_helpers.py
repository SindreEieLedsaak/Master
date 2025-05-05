import streamlit as st

def show_warning(message):
    """Display a warning message"""
    st.warning(message)

def show_code_output(title, output, language=None):
    """Display code output with a title"""
    st.subheader(title)
    if language:
        st.code(output, language=language)
    else:
        st.write(output)