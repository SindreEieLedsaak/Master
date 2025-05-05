import streamlit as st
import requests

def gitlab_projects_component():
    """Component for displaying and analyzing GitLab projects"""
    st.header("GitLab Projects Analysis")
    
    # Student ID input
    student_id = st.text_input("Student ID")
    
    # Tabs for different operations
    tab1, tab2, tab3 = st.tabs(["Fetch Projects", "Project List", "Analysis"])
    
    with tab1:
        st.subheader("Fetch Projects from GitLab")
        gitlab_username = st.text_input("GitLab Username")
        
        if st.button("Fetch Projects"):
            if not student_id or not gitlab_username:
                st.error("Please enter both Student ID and GitLab Username")
            else:
                with st.spinner("Fetching projects from GitLab..."):
                    try:
                        response = requests.post(
                            f"{API_BASE_URL}/gitlab/fetch-projects",
                            json={"student_id": student_id, "gitlab_username": gitlab_username}
                        )
                        
                        if response.status_code == 200:
                            data = response.json()
                            st.success(f"Successfully fetched {data.get('project_count', 0)} projects")
                        else:
                            st.error(f"Error: {response.json().get('detail', 'Unknown error')}")
                    except Exception as e:
                        st.error(f"Failed to connect to the server: {str(e)}")
    
    with tab2:
        st.subheader("Project List")
        
        if st.button("Load Projects"):
            if not student_id:
                st.error("Please enter Student ID")
            else:
                with st.spinner("Loading projects..."):
                    try:
                        response = requests.get(f"{API_BASE_URL}/gitlab/student/{student_id}/projects")
                        
                        if response.status_code == 200:
                            data = response.json()
                            projects = data.get("projects", [])
                            
                            if not projects:
                                st.info(f"No projects found for student {student_id}")
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
                        else:
                            st.error(f"Error: {response.json().get('detail', 'Unknown error')}")
                    except Exception as e:
                        st.error(f"Failed to connect to the server: {str(e)}")
    
    with tab3:
        st.subheader("Code Analysis")
        
        if st.button("Analyze Projects"):
            if not student_id:
                st.error("Please enter Student ID")
            else:
                with st.spinner("Analyzing projects (this may take a while)..."):
                    try:
                        response = requests.post(
                            f"{API_BASE_URL}/gitlab/analyze-projects",
                            json={"student_id": student_id}
                        )
                        
                        if response.status_code == 200:
                            analysis = response.json()
                            
                            # Display analysis results
                            st.success(f"Successfully analyzed {analysis.get('project_count', 0)} projects")
                            
                            # Language distribution
                            st.subheader("Language Distribution")
                            lang_data = analysis.get("language_distribution", {})
                            if lang_data:
                                st.bar_chart(lang_data)
                            
                            # Code quality
                            st.subheader("Code Quality")
                            quality = analysis.get("code_quality", {})
                            st.metric("Average Quality Score", f"{quality.get('average_score', 0):.2f}/5.0")
                            
                            # Quality distribution
                            quality_dist = quality.get("quality_distribution", {})
                            if quality_dist:
                                st.bar_chart(quality_dist)
                            
                            # Project summaries
                            st.subheader("Project Summaries")
                            for project in analysis.get("project_summaries", []):
                                with st.expander(project.get("project_name", "Unknown Project")):
                                    st.write(f"Files: {project.get('file_count', 0)}")
                                    st.write(f"Quality: {project.get('quality_score', 'Unknown')}")
                                    
                                    # File analyses
                                    if project.get("file_analyses"):
                                        st.write("Analyzed Files:")
                                        for file in project.get("file_analyses", []):
                                            st.write(f"- {file.get('file_name')}: {file.get('quality_score')}")
                        else:
                            st.error(f"Error: {response.json().get('detail', 'Unknown error')}")
                    except Exception as e:
                        st.error(f"Failed to connect to the server: {str(e)}")