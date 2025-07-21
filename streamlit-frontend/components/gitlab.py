import streamlit as st
import requests
from services.gitlab_service import fetch_gitlab_projects

def gitlab_projects_component():
    """Component for displaying and analyzing GitLab projects"""
    st.header("GitLab Projects Analysis")
    
    # Student ID input
    token = st.text_input("Token")
    
    # Tabs for different operations
    tab1, tab2 = st.tabs(["Fetch Projects", "Project List"])
            
    with tab1:
        st.subheader("Fetch Projects from GitLab")


        if st.button("Fetch Projects"):
            if not token:
                st.error("Please enter you GitLab token")
            else:
                with st.spinner("Fetching projects from GitLab..."):
                    data = fetch_gitlab_projects(token=token)
                    print(data)
                    
                        
    
    with tab2:
        st.subheader("Project List")
        try:
            response = data.json()
            
            if response.status_code == 200:
                data = response.json()
                projects = data.get("projects", [])
            else:
                    # Display projects in a dataframe
                    project_data = []
                    for p in projects:
                        project_data.append({
                            "Name": p.get("name"),
                            "Created": p.get("created_at"),
                            "Last Activity": p.get("last_activity_at"),
                            "Commit Count": p.get("stats", {}).get("commit_count", 0),
                            "File Count": p.get("stats", {}).get("file_count", 0),
                            "Languages": ", ".join(p.get("languages", {}).keys())
                        })
                    st.dataframe(project_data)
                    
            
        except Exception as e:
            st.error(f"Failed to connect to the server: {str(e)}")
    
