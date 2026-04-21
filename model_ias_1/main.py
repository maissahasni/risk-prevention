import uvicorn

def main() -> None:
    """
    Launch the PrevenTec FastAPI application with auto-reload enabled.
    """
    uvicorn.run(
        "app:app",       # path.to_module:app_instance
        host="127.0.0.1",
        port=8000,
        reload=True
    )

if __name__ == "__main__":
    main()