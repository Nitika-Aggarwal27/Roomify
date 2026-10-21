const PROJECT_PREFIX = 'roomify_project_';

const jsonError = (status, message, extra = {}) => {
    new Response(JSON.stringify({error: message, ...extra}), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
}

const getUserId = async (userPuter) => {
    try{
        const user = await userPuter.auth.getUser()

        return user ?.uuid || null
    } catch {
        return null;
    }
}

router.post('/api/projects/save', async ({ request, user }) => {
    try {
        const userPuter = user?.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const body = await request.json();
        const project = body?.project;

        if (!project?.id || !project?.sourceImage) {
            return jsonError(400, 'Project id and source image are required');
        }

        const payload = {
            ...project,
            updatedAt: new Date().toISOString(),
        };

        const key = `${PROJECT_PREFIX}${project.id}`;
        await userPuter.kv.set(key, payload);

        return { saved: true, id: project.id, project: payload };
    } catch (error) {
        return jsonError(500, 'Failed to save project', {
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

router.get('/api/projects/list', async ({ user }) => {
    try {
        const userPuter = user?.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const entries = await userPuter.kv.list(`${PROJECT_PREFIX}*`, true);
        return { projects: entries.map(({ value }) => ({ ...value, isPublic: true}) ) };
    } catch (error) {
        return jsonError(500, 'Failed to list projects', {
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

router.get('/api/projects/get', async ({ request, user }) => {
    try {
        const userPuter = user?.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const id = new URL(request.url).searchParams.get('id');
        if (!id) return jsonError(400, 'Project id is required');

        const project = await userPuter.kv.get(`${PROJECT_PREFIX}${id}`);
        if (project == null) return jsonError(404, 'Project not found');

        return { project };
    } catch (error) {
        return jsonError(500, 'Failed to get project', {
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
