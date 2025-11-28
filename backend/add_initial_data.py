import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

# More comprehensive sample data
sample_data = [
    {
        "content": "Multimodal AI systems can process and understand multiple types of data including text, images, audio, and video. This allows for more comprehensive artificial intelligence applications that can understand context across different media formats.",
        "media_type": "text"
    },
    {
        "content": "Achraf is a common name in several cultures. In a technical context, AI systems like this one can process information about people and topics but don't retain personal data between sessions for privacy and security reasons.",
        "media_type": "text"
    },
    {
        "content": "RAG (Retrieval Augmented Generation) enhances AI responses by first searching a knowledge base for relevant information, then using that context to generate more accurate and informed answers. This combines the benefits of search systems with generative AI.",
        "media_type": "text"
    },
    {
        "content": "Vector databases like ChromaDB store numerical representations of content called embeddings. These embeddings capture semantic meaning, allowing the system to find similar content even if the exact words don't match.",
        "media_type": "text"
    },
    {
        "content": "Shopusia appears to be an e-commerce or shopping related term. In multimodal AI systems, product images and descriptions can be processed together to provide better search and recommendation capabilities for shopping platforms.",
        "media_type": "text"
    },
    {
        "content": "Baby and children content is commonly processed by AI systems for applications in education, entertainment, and family services. Computer vision can identify objects in images while natural language processing understands textual descriptions.",
        "media_type": "text"
    }
]

def add_better_data():
    print(" Adding comprehensive sample data to improve search quality...")
    
    for i, item in enumerate(sample_data, 1):
        try:
            response = requests.post(
                f"{BASE_URL}/documents",
                data={
                    "content": item["content"],
                    "media_type": item["media_type"]
                }
            )
            
            if response.status_code == 200:
                print(f" Added document {i}: {item['content'][:50]}...")
            else:
                print(f" Failed to add document {i}: {response.text}")
                
        except Exception as e:
            print(f" Error adding document {i}: {e}")

if __name__ == "__main__":
    add_better_data()
    print("\n Better sample data added! Now try asking questions about multimodal AI, RAG, or Achraf")