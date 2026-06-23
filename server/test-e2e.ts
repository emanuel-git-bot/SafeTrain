const BASE_URL = 'http://localhost:3333';

async function runTests() {
  console.log('=== Início dos Testes de Comportamento ===\n');

  try {
    // 1. Admin Login
    console.log('[1/10] Fazendo login como Admin...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@safetrain.com', password: 'admin123' })
    });
    const adminData = await adminLoginRes.json() as any;
    if (!adminLoginRes.ok) throw new Error(`Falha no login admin: ${JSON.stringify(adminData)}`);
    const adminToken = adminData.token;
    console.log('✅ Admin logado com sucesso.\n');

    // 2. Create Certificate Template
    console.log('[2/10] Criando Template de Certificado...');
    const templateRes = await fetch(`${BASE_URL}/admin/certificate-templates`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ name: 'Template Terminal E2E' })
    });
    const templateData = await templateRes.json() as any;
    if (!templateRes.ok) throw new Error('Falha ao criar template');
    const templateId = templateData.id;
    console.log(`✅ Template criado com ID: ${templateId}\n`);

    // 3. Update Course with Template
    console.log('[3/10] Atualizando o Curso "NR-35" para usar o novo template...');
    const coursesRes = await fetch(`${BASE_URL}/courses`);
    const coursesData = await coursesRes.json() as any[];
    const nr35Course = coursesData.find((c: any) => c.title.includes('NR-35'));
    if (!nr35Course) throw new Error('Curso NR-35 não encontrado no banco (verifique o seed)');
    const courseId = nr35Course.id;

    const courseUpdateRes = await fetch(`${BASE_URL}/admin/courses/${courseId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: nr35Course.title,
        price: nr35Course.price,
        certificateTemplateId: templateId
      })
    });
    if (!courseUpdateRes.ok) throw new Error('Falha ao atualizar curso');
    console.log(`✅ Curso ${courseId} atualizado com Template ID: ${templateId}\n`);

    // 4. Register a New Student
    console.log('[4/10] Registrando novo aluno...');
    const studentEmail = `aluno.teste.${Date.now()}@exemplo.com`;
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aluno de Teste E2E',
        email: studentEmail,
        password: 'senhaforte123'
      })
    });
    const studentData = await registerRes.json() as any;
    if (!registerRes.ok) throw new Error('Falha no registro do aluno');
    const studentToken = studentData.token;
    console.log(`✅ Aluno registrado: ${studentEmail}\n`);

    // 5. Enroll in Course
    console.log('[5/10] Matriculando aluno no curso...');
    const enrollRes = await fetch(`${BASE_URL}/enrollments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ courseId })
    });
    const enrollData = await enrollRes.json() as any;
    if (!enrollRes.ok) throw new Error(`Falha na matrícula: ${JSON.stringify(enrollData)}`);
    const enrollmentId = enrollData.id;
    console.log(`✅ Aluno matriculado com sucesso. ID Matrícula: ${enrollmentId}\n`);

    // 6. Ping Video Module (simulate watching)
    console.log('[6/10] Simulando visualização de vídeo...');
    const courseDetailsRes = await fetch(`${BASE_URL}/courses/${courseId}`);
    const courseDetails = await courseDetailsRes.json() as any;
    const videoModule = courseDetails.modules?.find((m: any) => m.type === 'video');
    if (videoModule) {
      await fetch(`${BASE_URL}/enrollments/${enrollmentId}/ping`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({ moduleId: videoModule.id, timeSpent: 800 })
      });
      console.log('✅ Visualização computada.\n');
    }

    // 7. Complete Quiz
    console.log('[7/10] Respondendo Quiz final...');
    const quizModule = courseDetails.modules?.find((m: any) => m.type === 'quiz');
    if (quizModule) {
      let quizRes = await fetch(`${BASE_URL}/enrollments/${enrollmentId}/quiz`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({ moduleId: quizModule.id, answers: [2] }) // The correct answer is index 2 in seed
      });
      let quizData = await quizRes.json() as any;
      if (!quizData.passed) {
        console.log('⚠️ Tentando novamente com resposta "2m" ou índice diferente...');
        quizRes = await fetch(`${BASE_URL}/enrollments/${enrollmentId}/quiz`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
          },
          body: JSON.stringify({ moduleId: quizModule.id, answers: ["2m"] }) // try value instead of index
        });
        quizData = await quizRes.json() as any;
        if (quizData.passed) {
          console.log(`✅ Quiz aprovado na segunda tentativa! Score: ${quizData.score}\n`);
        } else {
          console.log(`❌ Não passou no quiz mesmo assim. Score: ${quizData.score}\n`);
        }
      } else {
        console.log(`✅ Quiz aprovado! Score: ${quizData.score}\n`);
      }
    }

    // 8. Complete Course & Generate Certificate
    console.log('[8/10] Concluindo curso...');
    const completeRes = await fetch(`${BASE_URL}/enrollments/${enrollmentId}/complete`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${studentToken}`
      }
    });
    const completeData = await completeRes.json() as any;
    console.log('Dados do complete:', completeData);
    if (!completeRes.ok) throw new Error(`Falha ao concluir curso: ${JSON.stringify(completeData)}`);
    console.log('✅ Curso concluído! Gerando certificado em background...\n');

    // 9. Download Certificate PDF
    console.log('[9/10] Baixando PDF do Certificado...');
    const certPdfRes = await fetch(`${BASE_URL}/enrollments/${enrollmentId}/certificate`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    if (!certPdfRes.ok) {
      const errText = await certPdfRes.text();
      throw new Error(`Falha ao baixar o PDF do certificado: ${certPdfRes.status} ${errText}`);
    }
    
    // We expect a code back in a header or we can get it from enrollment details
    console.log('✅ PDF gerado com sucesso (buffer recebido).\n');

    // Extrair o código do header Content-Disposition
    const contentDisposition = certPdfRes.headers.get('content-disposition');
    const match = contentDisposition?.match(/Certificado_(.+)\.pdf/);
    const myCertCode = match ? match[1] : null;

    console.log('[10/10] Validando Certificado Publicamente...');

    if (!myCertCode) {
      throw new Error(`Código do certificado não encontrado no header. Header: ${contentDisposition}`);
    }

    const validateRes = await fetch(`${BASE_URL}/validar/${myCertCode}`);
    const validateData = await validateRes.json() as any;
    if (validateData.valid) {
      console.log(`✅ Certificado VALIDADO com sucesso: ${myCertCode}`);
      console.log(`   Emitido para: ${validateData.issuedTo}`);
      console.log(`   Curso: ${validateData.course}`);
    } else {
      throw new Error('Certificado constou como inválido');
    }

    console.log('\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO! 🎉');

  } catch (error: any) {
    console.error('\n❌ ERRO DURANTE OS TESTES:');
    console.error(error.message);
  }
}

runTests();
