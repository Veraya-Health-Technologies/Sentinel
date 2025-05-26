# Sentinel AMR Surveillance Platform

A comprehensive antimicrobial resistance (AMR) surveillance platform built with Astro.js that standardizes and analyzes WHONET data for global health initiatives.

## Overview

The Sentinel platform provides a unified approach to AMR surveillance across human, animal, and environmental health sectors, following the One-Health paradigm.

## Features

- **Comprehensive Surveillance:** Unified approach across human, animal, and environmental health
- **Standardized Data:** Built on WHONET standards with enhanced validation and classification
- **WHO AWARE Integration:** Classification of antimicrobials according to WHO AWARE categories
- **Advanced Analytics:** Tools for detecting emerging resistance patterns

## Data Resources

- Organisms database with 2,946 standardized entries
- Comprehensive antimicrobials catalog with ATC codes
- WHO AWARE antimicrobial classifications
- Jupyter notebooks for data extraction and processing

## Technology

Built with:
- [Astro.js](https://astro.build) - The modern web framework
- [Tailwind CSS](https://tailwindcss.com) - For styling with a teal color theme
- [Jupyter](https://jupyter.org) - Data science notebooks for extraction and analysis

## Project Structure

```text
/
├── public/
├── project_resources/ - Data files and notebooks
│   ├── Organisms.txt - Raw WHONET organism data
│   ├── WHO_EML.xlsx - WHO Essential Medicines List
│   ├── Antimicrobials.xlsx - Antimicrobial agents data
│   └── Notebooks/ - Jupyter notebooks for data processing
├── src/
│   ├── assets/ - Images and SVG files
│   ├── components/ - Astro components
│   ├── layouts/ - Page layouts
│   ├── pages/ - Site pages
│   └── styles/ - Tailwind and global styles
```

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

## Data Processing

The project includes several Jupyter notebooks for processing WHONET data:
- `Organisms_Extraction_Notebook_Fixed.ipynb` - Extract organism codes and metadata
- `ATC_CODE_EXTRACTION_NOTEBOOK.ipynb` - Extract antimicrobial ATC codes
- `WHO_AWARE_nANTIBIOTIC_CLASS_Extraction.ipynb` - Process WHO AWARE classifications
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
