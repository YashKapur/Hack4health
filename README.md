# Hack4health - Team 8 bit titans

# Disease Detection LLM

An optimized project for accurate AI-driven disease diagnosis using real-world clinical datasets.

## 📋 About

Disease Detection LLM predicts medical diagnoses from patient symptoms and history using a large language model. The system is trained on thousands of authentic, de-identified medical examples and is designed for hackathons, research, and educational demos. Features include:
- Fast, explainable predictions
- Multi-symptom, multi-condition coverage
- Modular code and dataset structure  
- Easy integration and reproducibility

## 🛠️ Required Libraries

This project is built for Python 3.8+ and uses these core libraries:

- **pandas**: Data loading and cleaning  
- **datasets** (HuggingFace): Dataset handling  
- **unsloth**: Prompt engineering and fine-tuning LLMs  
- **transformers**: Pre-trained large language models  
- **trl**: Training utility for language models  
- **streamlit** (optional): Demo web UI

Install everything with:
```bash
pip install pandas datasets unsloth transformers trl
```

For the web/demo UI:
```bash
pip install streamlit
```
