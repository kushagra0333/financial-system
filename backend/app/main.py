from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from .api import router

app = FastAPI(title="Money Muling Detector", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

# Serve static files in production
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # If the file exists in static directory, StaticFiles handles it.
        # Otherwise, serve index.html for SPA routing.
        file_path = os.path.join(static_dir, full_path)
        if not os.path.isfile(file_path):
            return FileResponse(os.path.join(static_dir, "index.html"))
        return FileResponse(file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
