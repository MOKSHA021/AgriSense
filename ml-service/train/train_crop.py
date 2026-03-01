 
import os
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'Crop_recommendation.csv')

df = pd.read_csv(DATA_PATH)
print(f"Dataset loaded: {df.shape[0]} rows")
print(f"Columns: {list(df.columns)}")

X = df[['N','P','K','temperature','humidity','ph','rainfall']]
y = df['label']

le = LabelEncoder()
y_encoded = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

acc = accuracy_score(y_test, model.predict(X_test))
print(f"Crop Model Accuracy: {round(acc*100, 2)}%")

joblib.dump(model, os.path.join(BASE_DIR, 'models', 'crop_model.pkl'))
joblib.dump(le,    os.path.join(BASE_DIR, 'models', 'label_encoder.pkl'))
print("Crop model saved to models/")
