# Development Environment Guidelines

<!-- ## System Specifications
- OS: Linux
- GPU: NVIDIA GeForce RTX 4060 Ti 8GB
- NVIDIA Driver: 535.183.01
- CUDA Version: 12.2 -->

## Development Standards

<!-- ### Python Projects
- **Package Manager**: Use `uv` instead of `pip` for all installations
- **API Framework**: Confirm with user whether to expose API using FastAPI -->

### Frontend Stack
- **Framework**: React
- **Styling**: Tailwind CSS (responsive design)
- **Icons**: Lucide React
- **Internationalization**: English/Traditional Chinese (zh-TW) with language switcher

### Testing
- Skip automated browser/agent testing
- User will perform manual testing

## Workflow
<!-- 1. For Python applications, ask: "Should I expose the API using FastAPI?"
2. Use `uv add [package]` or `uv pip install [package]`  -->
3. Implement bilingual UI (EN/ZH-TW) with toggle
4. Ensure responsive design with Tailwind
5. Skip test automation - provide testing instructions instead