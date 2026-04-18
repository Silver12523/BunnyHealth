from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models

# 创建数据库所有表
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BunnyHealth API")

@app.get("/")
def read_root():
    return {"message": "Welcome to BunnyHealth API"}

# 用户测试接口
@app.post("/users/")
def create_user(username: str, target_calories: float, db: Session = Depends(get_db)):
    db_user = models.User(username=username, target_calories=target_calories)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # 初始化宠物
    db_pet = models.Pet(user_id=db_user.id, name="My Bunny")
    db.add(db_pet)
    db.commit()
    
    return {"message": "User and Pet created", "user_id": db_user.id}

def calculate_disease_states(pet: models.Pet):
    """根据各项HP计算当前疾病状态，供前端加载插图图层"""
    diseases = []
    
    # 死亡判定
    if pet.health_hp <= 0:
        return [{"element": "general", "severity": "dead", "symptom": "已死亡", "layer_name": "dead_ghost"}]

    # 1. 肥胖 (fat)
    if pet.fat_level >= 80:
        diseases.append({"element": "fat", "severity": "severe", "symptom": "重度肥胖", "layer_name": "fat_severe"})
    elif pet.fat_level >= 50:
        diseases.append({"element": "fat", "severity": "mild", "symptom": "轻度肥胖", "layer_name": "fat_mild"})

    # 2. 铁 Fe (iron)
    if pet.iron_hp < 40:
        diseases.append({"element": "iron", "severity": "severe", "symptom": "缺铁性贫血、极度疲劳、免疫力下降", "layer_name": "iron_severe"})
    elif pet.iron_hp < 80:
        diseases.append({"element": "iron", "severity": "mild", "symptom": "面色苍白、畏寒", "layer_name": "iron_mild"})

    # 3. 钙 Ca (calcium)
    if pet.calcium_hp < 40:
        diseases.append({"element": "calcium", "severity": "severe", "symptom": "骨质疏松/佝偻病、骨质软化", "layer_name": "calcium_severe"})
    elif pet.calcium_hp < 80:
        diseases.append({"element": "calcium", "severity": "mild", "symptom": "肌肉痉挛(抽筋)", "layer_name": "calcium_mild"})

    # 4. 碘 I (iodine)
    if pet.iodine_hp < 40:
        diseases.append({"element": "iodine", "severity": "severe", "symptom": "呆小症(智力低下、发育迟缓)", "layer_name": "iodine_severe"})
    elif pet.iodine_hp < 80:
        diseases.append({"element": "iodine", "severity": "mild", "symptom": "地方性甲状腺肿(大脖子病)", "layer_name": "iodine_mild"})

    # 5. 维C (vit_c)
    if pet.vit_c_hp < 40:
        diseases.append({"element": "vit_c", "severity": "severe", "symptom": "重度坏血病(牙龈出血)", "layer_name": "vit_c_severe"})
    elif pet.vit_c_hp < 80:
        diseases.append({"element": "vit_c", "severity": "mild", "symptom": "毛发脱落、轻度坏血", "layer_name": "vit_c_mild"})

    return diseases

@app.get("/pets/{user_id}")
def read_pet(user_id: int, db: Session = Depends(get_db)):
    pet = db.query(models.Pet).filter(models.Pet.user_id == user_id).first()
    if pet is None:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    active_diseases = calculate_disease_states(pet)
    
    return {
        "pet": pet,
        "active_diseases": active_diseases
    }
