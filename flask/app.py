import os
from flask import Flask, request, jsonify, render_template
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer # Changed import
from transformers import TextStreamer

# --- Configuration for Model Loading ---
max_seq_length = 2048
dtype = None # Let transformers handle dtype for CPU
load_in_4bit = True # Keep this for memory efficiency

# --- Flask Application Setup ---
app = Flask(__name__)

# --- Global Model and Tokenizer Loading ---
try:
    print("Loading model and tokenizer... This may take a while.")
    
    device = "cpu" 
    print(f"Forcing model to load on: {device.upper()}")

    # Load model directly using transformers
    # `load_in_4bit=True` requires `bitsandbytes` to be installed.
    model = AutoModelForCausalLM.from_pretrained(
        "unsloth/Llama-3.2-3B-Instruct",
        load_in_4bit=load_in_4bit, # Apply 4-bit quantization
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32, # Use float16 if CUDA, else float32 for CPU
        low_cpu_mem_usage=True, # Helps with CPU memory usage during loading
        # token="hf_...", # Uncomment and add your Hugging Face token if using gated models
    )
    # Explicitly move model to CPU after loading.
    model.to(device)

    # Load tokenizer directly using transformers
    tokenizer = AutoTokenizer.from_pretrained(
        "unsloth/Llama-3.2-3B-Instruct",
        # token="hf_...", # Uncomment and add your Hugging Face token if using gated models
    )
    # Ensure the tokenizer has a pad_token if it's missing, common for LLMs
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    print("Model and tokenizer loaded successfully!")
    print(f"Model is running on: {model.device}") # Confirm the device

except Exception as e:
    print(f"Error loading model: {e}")
    print("Please ensure you have sufficient RAM and the correct packages installed (transformers, bitsandbytes, accelerate).")
    model = None
    tokenizer = None

# --- Routes ---

@app.route('/')
def index():
    """Renders the main HTML page for the chat interface."""
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    """
    Handles POST requests for model inference.
    Expects a JSON payload with 'symptoms'.
    Returns a JSON response with the generated text.
    """
    if model is None or tokenizer is None:
        return jsonify({"error": "Model not loaded. Please check server logs."}), 500

    try:
        data = request.get_json()
        user_input = data.get('symptoms', '')

        if not user_input:
            return jsonify({"error": "No symptoms provided."}), 400

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a medical doctor. Based on the user's symptoms, suggest the possible disease "
                    "and which type of doctor or specialist they should consult. "
                    "If the symptoms are unclear, ask a follow-up question."
                )
            },
            {"role": "user", "content": user_input},
        ]

        # Prepare input with the chat template and move to the CPU
        inputs = tokenizer.apply_chat_template(
            messages,
            tokenize=True,
            add_generation_prompt=True,
            return_tensors="pt",
        ).to(model.device) # Use the device the model is on (which is 'cpu' now)

        outputs = model.generate(
            input_ids=inputs,
            max_new_tokens=2048,
            use_cache=True,
            temperature=1.5,
            min_p=0.1,
            pad_token_id=tokenizer.pad_token_id # Important for generation
        )

        response_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

        # The chat template adds the system and user prompt at the beginning.
        # We need to extract only the assistant's response.
        # A simple way is to find the last assistant tag and take content after it.
        # This is a basic approach and might need refinement for complex chat histories.
        # Llama-3.1 uses <|start_header_id|> and <|end_header_id|>
        assistant_tag = "<|start_header_id|>assistant<|end_header_id|>\n\n"
        if assistant_tag in response_text:
            response_text = response_text.split(assistant_tag, 1)[1].strip()
        # Also remove the <|eot_id|> if it's present at the end
        if response_text.endswith("<|eot_id|>"):
            response_text = response_text.replace("<|eot_id|>", "").strip()


        return jsonify({"response": response_text})

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({"error": str(e)}), 500

# --- Run the Flask Application ---
if __name__ == '__main__':
    os.makedirs('templates', exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=True)
