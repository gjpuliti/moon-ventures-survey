import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ============================================
  // MOCK DATA - REMOVER QUANDO HUBSPOT ESTIVER CONFIGURADO
  // ============================================
  // Este arquivo contém dados mock para testar o frontend.
  // Quando a integração com HubSpot estiver pronta, você pode:
  // 1. Remover os dados mock deste seed
  // 2. Criar perguntas via admin panel
  // 3. Ou manter este seed apenas para desenvolvimento
  // ============================================

  // Create default admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'admin',
    },
  });

  console.log('Created admin user:', adminUser.email);

  // Create default survey
  const survey = await prisma.survey.upsert({
    where: { id: 'default-survey-id' },
    update: {},
    create: {
      id: 'default-survey-id',
      name: 'Post-Purchase Survey',
      isActive: true,
      branding: {
        logoUrl: '',
        primaryColor: '#000000',
        secondaryColor: '#666666',
        backgroundColor: '#ffffff',
        textColor: '#000000',
      },
    },
  });

  console.log('Created default survey:', survey.name);

  // ============================================
  // MOCK STEPS AND QUESTIONS - DADOS DE TESTE
  // ============================================
  // Os steps e perguntas abaixo são mockados baseados na pesquisa original
  // encontrada em https://clubeminimal.com.br/pesquisa_pos_compra
  // ============================================

  // Step 1
  const step1 = await prisma.step.upsert({
    where: { 
      surveyId_order: {
        surveyId: survey.id,
        order: 1
      }
    },
    update: {},
    create: {
      surveyId: survey.id,
      order: 1,
      name: 'ETAPA 1',
      description: 'Informações sobre como conheceu a Minimal',
    },
  });

  // Step 1 Questions
  await prisma.question.upsert({
    where: {
      stepId_order: {
        stepId: step1.id,
        order: 1
      }
    },
    update: {},
    create: {
      stepId: step1.id,
      order: 1,
      text: 'Por onde você conheceu a Minimal?',
      type: 'dropdown',
      options: [
        'Influenciador',
        'Twitter / X',
        'TikTok',
        'Podcast',
        'Pesquisei no Google',
        'Indicação de amigos ou familiares',
        'Youtube Patrocinado',
        'Youtube Vídeo',
        'The News',
        'Recebi de brinde / empresa',
        'Ganhei de presente',
        'Facebook Patrocinado',
        'Facebook Perfil Minimal',
        'Instagram Patrocinado',
        'Instagram Perfil Minimal',
        'Livelo',
        'Outro'
      ],
      isRequired: true,
      hubspotProperty: 'how_did_you_hear_about_us', // MOCK PROPERTY
      nestingLevel: 0,
    },
  });

  await prisma.question.upsert({
    where: {
      stepId_order: {
        stepId: step1.id,
        order: 2
      }
    },
    update: {},
    create: {
      stepId: step1.id,
      order: 2,
      text: 'O que te trouxe ao nosso site HOJE?',
      type: 'dropdown',
      options: [
        'Alguém me recomendou',
        'Recebi um e-mail',
        'Vi um post de Influenciador',
        'Contato de um vendedor',
        'Pesquisei no Google',
        'Ouvi em um Podcast',
        'Recebi uma mensagem',
        'Vi um anúncio',
        'Me lembrei da marca',
        'Outro'
      ],
      isRequired: true,
      hubspotProperty: 'what_brought_you_today', // MOCK PROPERTY
      nestingLevel: 0,
    },
  });

  await prisma.question.upsert({
    where: {
      stepId_order: {
        stepId: step1.id,
        order: 3
      }
    },
    update: {},
    create: {
      stepId: step1.id,
      order: 3,
      text: 'Quando você ouviu falar da Minimal pela primeira vez?',
      type: 'dropdown',
      options: [
        'Hoje',
        'Essa semana',
        'Esse mês',
        'Entre 1 e 3 meses',
        'Entre 3 meses e 1 ano',
        'Mais de 1 ano'
      ],
      isRequired: true,
      hubspotProperty: 'first_heard_about_minimal', // MOCK PROPERTY
      nestingLevel: 0,
    },
  });

  await prisma.question.upsert({
    where: {
      stepId_order: {
        stepId: step1.id,
        order: 4
      }
    },
    update: {},
    create: {
      stepId: step1.id,
      order: 4,
      text: 'Essa compra foi feita para quem?',
      type: 'dropdown',
      options: [
        'Você',
        'Seu namorado / esposo',
        'Seu amigo',
        'Seu filho',
        'Seu pai',
        'Seu irmão',
        'Outro'
      ],
      isRequired: true,
      hubspotProperty: 'purchase_for_who', // MOCK PROPERTY
      nestingLevel: 0,
    },
  });

  // Step 2
  const step2 = await prisma.step.upsert({
    where: { 
      surveyId_order: {
        surveyId: survey.id,
        order: 2
      }
    },
    update: {},
    create: {
      surveyId: survey.id,
      order: 2,
      name: 'ETAPA 2',
      description: 'Informações demográficas',
    },
  });

  await prisma.question.upsert({
    where: {
      stepId_order: {
        stepId: step2.id,
        order: 1
      }
    },
    update: {},
    create: {
      stepId: step2.id,
      order: 1,
      text: 'Qual a sua idade?',
      type: 'dropdown',
      options: [
        'Menos de 13 anos',
        'Entre 13 e 17 anos',
        '18 a 24 anos',
        '25 a 34 anos',
        '35 a 44 anos',
        '45 a 54 anos',
        '55 a 64 anos',
        'Mais de 65 anos'
      ],
      isRequired: true,
      hubspotProperty: 'age_range', // MOCK PROPERTY
      nestingLevel: 0,
    },
  });

  await prisma.question.upsert({
    where: {
      stepId_order: {
        stepId: step2.id,
        order: 2
      }
    },
    update: {},
    create: {
      stepId: step2.id,
      order: 2,
      text: 'Qual sua data de nascimento?',
      type: 'date',
      isRequired: true,
      hubspotProperty: 'birth_date', // MOCK PROPERTY
      nestingLevel: 0,
    },
  });

  await prisma.question.upsert({
    where: {
      stepId_order: {
        stepId: step2.id,
        order: 3
      }
    },
    update: {},
    create: {
      stepId: step2.id,
      order: 3,
      text: 'Qual o seu sexo?',
      type: 'dropdown',
      options: [
        'Feminino',
        'Masculino',
        'Prefiro não responder'
      ],
      isRequired: true,
      hubspotProperty: 'gender', // MOCK PROPERTY
      nestingLevel: 0,
    },
  });

  // Step 3
  const step3 = await prisma.step.upsert({
    where: { 
      surveyId_order: {
        surveyId: survey.id,
        order: 3
      }
    },
    update: {},
    create: {
      surveyId: survey.id,
      order: 3,
      name: 'ETAPA 3',
      description: 'Feedback sobre a experiência',
    },
  });

  const step3Q1 = await prisma.question.upsert({
    where: {
      stepId_order: {
        stepId: step3.id,
        order: 1
      }
    },
    update: {},
    create: {
      stepId: step3.id,
      order: 1,
      text: 'Teve alguma parte do nosso site que foi difícil de usar?',
      type: 'dropdown',
      options: ['Sim', 'Não'],
      isRequired: true,
      hubspotProperty: 'site_difficult_to_use', // MOCK PROPERTY
      nestingLevel: 0,
    },
  });

  // Conditional question - aparece se resposta for "Sim"
  await prisma.question.upsert({
    where: {
      stepId_order: {
        stepId: step3.id,
        order: 2
      }
    },
    update: {},
    create: {
      stepId: step3.id,
      order: 2,
      text: 'Como podemos melhorar?',
      type: 'textarea',
      isRequired: false,
      hubspotProperty: 'improvement_suggestions', // MOCK PROPERTY
      parentQuestionId: step3Q1.id,
      conditionValue: 'Sim',
      nestingLevel: 1,
    },
  });

  // Step 4
  const step4 = await prisma.step.upsert({
    where: { 
      surveyId_order: {
        surveyId: survey.id,
        order: 4
      }
    },
    update: {},
    create: {
      surveyId: survey.id,
      order: 4,
      name: 'ETAPA 4',
      description: 'Opinião sobre produtos e concorrência',
    },
  });

  await prisma.question.upsert({
    where: {
      stepId_order: {
        stepId: step4.id,
        order: 1
      }
    },
    update: {},
    create: {
      stepId: step4.id,
      order: 1,
      text: 'Você considera o preço de nossos produtos:',
      type: 'dropdown',
      options: ['Barato', 'Justo', 'Caro', 'Outro'],
      isRequired: true,
      hubspotProperty: 'price_perception', // MOCK PROPERTY
      nestingLevel: 0,
    },
  });

  await prisma.question.upsert({
    where: {
      stepId_order: {
        stepId: step4.id,
        order: 2
      }
    },
    update: {},
    create: {
      stepId: step4.id,
      order: 2,
      text: 'Quais marcas você considerou comprar antes da Minimal?',
      type: 'checkbox',
      options: [
        'Nenhuma',
        'Insider',
        'Reserva',
        'Hering',
        'Renner',
        'Oficina',
        'Ricardo Almeida',
        'Basicamente',
        'Urbô',
        'Lawe',
        'Outra'
      ],
      isRequired: true,
      hubspotProperty: 'considered_brands', // MOCK PROPERTY
      nestingLevel: 0,
    },
  });

  await prisma.question.upsert({
    where: {
      stepId_order: {
        stepId: step4.id,
        order: 3
      }
    },
    update: {},
    create: {
      stepId: step4.id,
      order: 3,
      text: 'Por que escolheu a Minimal e não alguma das outras?',
      type: 'checkbox',
      options: [
        'Preço',
        'Qualidade',
        'Modelagem',
        'Custo-benefício',
        'Prazo de entrega',
        'Conhecer a marca',
        'Garantia de 30 dias',
        'Outro'
      ],
      isRequired: true,
      hubspotProperty: 'why_chose_minimal', // MOCK PROPERTY
      nestingLevel: 0,
    },
  });

  await prisma.question.upsert({
    where: {
      stepId_order: {
        stepId: step4.id,
        order: 4
      }
    },
    update: {},
    create: {
      stepId: step4.id,
      order: 4,
      text: 'Qual novo produto espera ver na Minimal?',
      type: 'textarea',
      isRequired: true,
      hubspotProperty: 'expected_new_products', // MOCK PROPERTY
      nestingLevel: 0,
    },
  });

  console.log('✅ Mock data created successfully!');
  console.log('📝 Created 4 steps with questions');
  console.log('⚠️  Remember: HubSpot properties are MOCKED - update when HubSpot is configured');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
