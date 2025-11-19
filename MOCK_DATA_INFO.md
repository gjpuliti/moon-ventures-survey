# 📋 Informações sobre Dados Mock

## ⚠️ IMPORTANTE: Dados Mock para Teste

Este projeto contém dados mock para permitir testar o frontend sem necessidade de configuração completa do HubSpot.

## 📍 Onde estão os dados mock?

### 1. Backend - Seed File
**Arquivo:** `backend/prisma/seed.ts`

Este arquivo contém:
- ✅ Usuário admin padrão
- ✅ Survey padrão com branding
- ✅ **4 Steps mockados** baseados na pesquisa original
- ✅ **Perguntas mockadas** com propriedades HubSpot fictícias

**Propriedades HubSpot Mockadas:**
- `how_did_you_hear_about_us`
- `what_brought_you_today`
- `first_heard_about_minimal`
- `purchase_for_who`
- `age_range`
- `birth_date`
- `gender`
- `site_difficult_to_use`
- `improvement_suggestions`
- `price_perception`
- `considered_brands`
- `why_chose_minimal`
- `expected_new_products`

### 2. Como atualizar quando HubSpot estiver configurado?

1. **Opção 1:** Manter o seed apenas para desenvolvimento
   - Os dados mock continuam disponíveis para testes locais
   - Crie perguntas reais via admin panel em produção

2. **Opção 2:** Atualizar o seed com propriedades reais
   - Edite `backend/prisma/seed.ts`
   - Substitua as propriedades mockadas (ex: `how_did_you_hear_about_us`) pelas propriedades reais do HubSpot
   - Execute `npm run prisma:seed` novamente

3. **Opção 3:** Remover dados mock do seed
   - Remova as seções marcadas com `// MOCK DATA`
   - Mantenha apenas o usuário admin e survey básico

## 🔄 Para recriar os dados mock:

```bash
cd backend
npm run prisma:seed
```

## 📝 Estrutura dos dados mock:

- **Step 1:** Como conheceu a Minimal (4 perguntas)
- **Step 2:** Informações demográficas (3 perguntas)
- **Step 3:** Feedback sobre experiência (2 perguntas, sendo 1 condicional)
- **Step 4:** Opinião sobre produtos (4 perguntas)

Total: **13 perguntas** distribuídas em **4 etapas**

## ⚡ Próximos passos:

1. Quando HubSpot estiver configurado, atualize as propriedades no seed
2. Ou crie perguntas via admin panel em `/admin/questions`
3. As propriedades mockadas serão substituídas pelas reais automaticamente

