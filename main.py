from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session
import os
import asyncio

# Configurações do Banco de Dados
DATABASE_URL = "postgresql://user:password@localhost:5432/estrategia_forense"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modelos do Banco de Dados
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    oab_number = Column(String)

class Case(Base):
    __tablename__ = "cases"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    client_name = Column(String)
    represented_party = Column(String)
    law_area = Column(String)
    case_number = Column(String)
    court = Column(String)
    phase = Column(String)
    objective = Column(Text)

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    file_name = Column(String)
    file_path = Column(String)
    extracted_text = Column(Text)

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    report_content = Column(Text)

# Base.metadata.create_all(bind=engine) # Descomente para criar as tabelas no Postgres

# Inicialização do FastAPI
app = FastAPI(title="Estratégia Forense IA - API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, defina a URL correta (ex: do front-end)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Função simulada de extração de texto do PDF
def extract_text_from_pdf(file_path: str) -> str:
    # Integrar bibliotecas como PyPDF2, pdfplumber ou pytesseract
    return "Texto simulado extraído do PDF da Petição Inicial..."

# Prompts de Sistema para IA (Baseados nas diretrizes do usuário)
PROMPTS = {
    "classificacao": "Analise o conteúdo do PDF enviado e tente identificar os documentos nele contidos. Classifique cada trecho ou documento como petição inicial, contestação, réplica, decisão, sentença, acórdão, procuração, contrato, comprovante, laudo, print, documento pessoal, cálculo, recurso, certidão, intimação ou outro.\nContexto: {contexto}",
    "provas": "Com base nos documentos enviados, separe os fatos em: fatos documentalmente provados, parcialmente provados, dependentes de prova testemunhal e sem prova suficiente.\nContexto: {contexto}",
    "riscos": "Com base exclusivamente nos documentos, identifique riscos processuais (baixo, moderado, alto, crítico) como prescrição, decadência, falta de prova, contradição.\nContexto: {contexto}",
    "relatorio_estrategico": "Gere um relatório estratégico final identificando a síntese do caso, pontos favoráveis e desfavoráveis, e a providência recomendada para o advogado. Diferencie fatos comprovados de alegações. Não prometa resultado.\nContexto: {contexto}"
}

# Simulação de chamada para API de LLM (Ex: LangChain / OpenAI / Anthropic)
async def call_llm(prompt_template: str, contexto: str) -> str:
    prompt = prompt_template.format(contexto=contexto)
    # Exemplo real usando langchain ou openai:
    # response = openai.ChatCompletion.create(model="gpt-4", messages=[{"role": "user", "content": prompt}])
    # return response.choices[0].message.content
    
    await asyncio.sleep(1) # Simula delay da API de IA
    return f"Resultado simulado da IA processado com base no contexto."

@app.post("/api/upload")
async def upload_document(
    file: UploadFile = File(...),
    case_id: int = Form(...),
    db: Session = Depends(get_db)
):
    """
    Recebe o arquivo PDF do frontend.
    """
    file_location = f"uploads/{file.filename}"
    os.makedirs("uploads", exist_ok=True)
    
    with open(file_location, "wb+") as file_object:
        file_object.write(await file.read())
        
    extracted_text = extract_text_from_pdf(file_location)
    
    # Salva no DB
    # new_doc = Document(case_id=case_id, file_name=file.filename, file_path=file_location, extracted_text=extracted_text)
    # db.add(new_doc)
    # db.commit()
    # db.refresh(new_doc)
    
    return {"message": "Upload realizado com sucesso", "filename": file.filename, "extracted_text_preview": extracted_text[:100]}

@app.post("/api/analyze")
async def analyze_document(case_id: int, db: Session = Depends(get_db)):
    """
    Roda a pipeline de IA baseada nos prompts de sistema encadeados.
    """
    # 1. Buscar o texto extraído do banco de dados com base no case_id
    # doc = db.query(Document).filter(Document.case_id == case_id).first()
    # if not doc: raise HTTPException(status_code=404, detail="Documento não encontrado")
    # contexto = doc.extracted_text
    
    contexto_simulado = "Texto da petição inicial com dados do caso..."
    
    # 2. Executar Pipeline de IA (Chain of Prompts)
    resultado_classificacao = await call_llm(PROMPTS["classificacao"], contexto_simulado)
    resultado_provas = await call_llm(PROMPTS["provas"], contexto_simulado)
    resultado_riscos = await call_llm(PROMPTS["riscos"], contexto_simulado)
    
    # O relatório estratégico final pode usar as análises anteriores como contexto adicional
    contexto_enriquecido = f"{contexto_simulado}\n\n[Classificações: {resultado_classificacao}]\n\n[Riscos: {resultado_riscos}]"
    relatorio_final = await call_llm(PROMPTS["relatorio_estrategico"], contexto_enriquecido)
    
    # 3. Salvar relatório no DB
    # new_report = Report(case_id=case_id, report_content=relatorio_final)
    # db.add(new_report)
    # db.commit()
    
    return {
        "status": "success",
        "classificacao": resultado_classificacao,
        "provas": resultado_provas,
        "riscos": resultado_riscos,
        "relatorio_estrategico": relatorio_final
    }

if __name__ == "__main__":
    import uvicorn
    # Para rodar, use o comando: uvicorn main:app --reload
    uvicorn.run(app, host="0.0.0.0", port=8000)
