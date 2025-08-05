# import gitlab

# GITLAB_URL = 'https://git.app.uib.no'               # or your self-hosted instance
# PRIVATE_TOKEN = 'NA5F7CvfX2sXd6CrvaA3'

# gl = gitlab.Gitlab(GITLAB_URL, private_token=PRIVATE_TOKEN)

# owned_projects = gl.projects.list(owned=True, all=True)
# print("Owned Projects:")
# for proj in owned_projects:
#     print(proj.id, proj.name, proj.web_url)


def counter(n : int ):
    for y in range(0, n):
        print(y)

counter(10)