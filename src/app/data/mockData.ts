// ─── Mock Data ───────────────────────────────────────────────────────────────

export const AREAS = [
  { id: "construction", label: "Construção Civil", icon: "🏗️" },
  { id: "industry", label: "Indústria", icon: "🏭" },
  { id: "logistics", label: "Logística", icon: "🚛" },
  { id: "healthcare", label: "Saúde", icon: "🏥" },
  { id: "electrical", label: "Elétrica", icon: "⚡" },
  { id: "chemicals", label: "Química", icon: "🧪" },
];

export const COURSES = [
  { id: 1, title: "NR-35: Trabalho em Altura", area: "construction", level: "Obrigatório", duration: "8h", rating: 4.9, students: 12400, price: 89, image: "photo-1504307651254-35680f356dfd", modules: 12, cert: true, desc: "Norma regulamentadora para atividades realizadas em alturas superiores a 2 metros." },
  { id: 2, title: "NR-10: Segurança em Instalações Elétricas", area: "electrical", level: "Obrigatório", duration: "40h", rating: 4.8, students: 8900, price: 249, image: "photo-1558618666-fcd25c85cd64", modules: 22, cert: true, desc: "Requisitos e condições mínimas para implementação de medidas de controle e sistemas preventivos." },
  { id: 3, title: "CIPA: Comissão Interna de Prevenção", area: "industry", level: "Recomendado", duration: "20h", rating: 4.7, students: 6200, price: 149, image: "photo-1581092160562-40aa08e78837", modules: 15, cert: true, desc: "Formação completa para membros da CIPA com foco em prevenção de acidentes." },
  { id: 4, title: "EPI: Uso e Conservação", area: "industry", level: "Básico", duration: "4h", rating: 4.6, students: 21000, price: 49, image: "photo-1565793298595-6a879b1d9492", modules: 6, cert: true, desc: "Fundamentos sobre seleção, uso correto e manutenção de EPIs." },
  { id: 5, title: "NR-12: Segurança em Máquinas e Equipamentos", area: "industry", level: "Obrigatório", duration: "16h", rating: 4.8, students: 5400, price: 179, image: "photo-1504917595217-d4dc5ebe6122", modules: 18, cert: true, desc: "Medidas preventivas de segurança para instalação, operação e manutenção de máquinas." },
  { id: 6, title: "Primeiros Socorros no Trabalho", area: "healthcare", level: "Recomendado", duration: "6h", rating: 4.9, students: 15200, price: 69, image: "photo-1559757175-7cb036e0a2d6", modules: 8, cert: true, desc: "Procedimentos básicos de emergência para situações de acidente no trabalho." },
];

export const PARTNERS = ["Gerdau", "Votorantim", "Vale", "Ambev", "Embraer", "Petrobras", "JBS", "BRF"];

export const MODULES_BUILDER = [
  { id: 1, type: "video", title: "Introdução à NR-35", duration: "12min", status: "published" },
  { id: 2, type: "video", title: "Equipamentos obrigatórios", duration: "18min", status: "published" },
  { id: 3, type: "quiz", title: "Avaliação — Módulo 1", questions: 10, status: "published" },
  { id: 4, type: "video", title: "Técnicas de ancoragem", duration: "24min", status: "draft" },
  { id: 5, type: "video", title: "Análise de risco", duration: "15min", status: "draft" },
  { id: 6, type: "quiz", title: "Avaliação Final", questions: 20, status: "draft" },
];

export const EMPLOYEES = [
  { id: 1, name: "Carlos Mendes", email: "carlos@votorantim.com", role: "Operador de Máquinas", progress: 100, courses: 3, cert: true, lastActive: "hoje", status: "certified" },
  { id: 2, name: "Ana Ferreira", email: "ana@votorantim.com", role: "Supervisora de Linha", progress: 67, courses: 2, cert: false, lastActive: "2 dias", status: "in_progress" },
  { id: 3, name: "Roberto Lima", email: "roberto@votorantim.com", role: "Técnico de Segurança", progress: 100, courses: 5, cert: true, lastActive: "hoje", status: "certified" },
  { id: 4, name: "Juliana Costa", email: "juliana@gmail.com", role: "Auxiliar de Produção", progress: 33, courses: 1, cert: false, lastActive: "5 dias", status: "in_progress" },
  { id: 5, name: "Marcos Silva", email: "marcos@gmail.com", role: "Eletricista", progress: 0, courses: 0, cert: false, lastActive: "—", status: "pending" },
  { id: 6, name: "Fernanda Rocha", email: "fernanda@votorantim.com", role: "Operadora", progress: 100, courses: 4, cert: true, lastActive: "hoje", status: "certified" },
];

export const ALL_STUDENTS = [
  { id: 1, name: "Carlos Mendes", email: "carlos.mendes@email.com", type: "b2b", company: "Votorantim", courses: 3, certs: 3, joined: "03/01/2024", status: "active" },
  { id: 2, name: "Ana Ferreira", email: "ana.ferreira@gmail.com", type: "b2c", company: null as null, courses: 2, certs: 1, joined: "15/02/2024", status: "active" },
  { id: 3, name: "Roberto Lima", email: "roberto.lima@email.com", type: "b2b", company: "Gerdau", courses: 5, certs: 5, joined: "08/01/2024", status: "active" },
  { id: 4, name: "Juliana Costa", email: "juliana.costa@gmail.com", type: "b2c", company: null as null, courses: 1, certs: 0, joined: "22/03/2024", status: "active" },
  { id: 5, name: "Marcos Silva", email: "marcos.silva@email.com", type: "b2b", company: "Vale", courses: 0, certs: 0, joined: "10/04/2024", status: "pending" },
  { id: 6, name: "Fernanda Rocha", email: "fernanda.rocha@gmail.com", type: "b2c", company: null as null, courses: 4, certs: 4, joined: "05/01/2024", status: "active" },
  { id: 7, name: "Diego Alves", email: "diego.alves@email.com", type: "b2b", company: "Ambev", courses: 2, certs: 1, joined: "18/02/2024", status: "active" },
  { id: 8, name: "Patricia Nunes", email: "patricia.nunes@gmail.com", type: "b2c", company: null as null, courses: 6, certs: 6, joined: "12/01/2024", status: "active" },
];

export const ALL_CERTS = [
  { id: "EPI-2024-NR35-48291", student: "Carlos Mendes", course: "NR-35: Trabalho em Altura", type: "b2b", company: "Votorantim", issued: "18/06/2024", expires: "18/06/2026" },
  { id: "EPI-2024-NR10-39182", student: "Roberto Lima", course: "NR-10: Seg. Elétrica", type: "b2b", company: "Gerdau", issued: "05/05/2024", expires: "05/05/2026" },
  { id: "EPI-2024-EPI-29301", student: "Ana Ferreira", course: "EPI: Uso e Conservação", type: "b2c", company: null as null, issued: "22/04/2024", expires: "22/04/2026" },
  { id: "EPI-2024-CIPA-18402", student: "Fernanda Rocha", course: "CIPA: Prevenção", type: "b2c", company: null as null, issued: "10/03/2024", expires: "10/03/2026" },
  { id: "EPI-2024-PS-07513", student: "Patricia Nunes", course: "Primeiros Socorros", type: "b2c", company: null as null, issued: "01/02/2024", expires: "01/02/2026" },
  { id: "EPI-2023-NR12-96614", student: "Diego Alves", course: "NR-12: Máquinas", type: "b2b", company: "Ambev", issued: "15/11/2023", expires: "15/11/2025" },
];

export const CHART_MONTHLY = [
  { month: "Jan", matriculas: 48, concluidos: 32, receita: 4200 },
  { month: "Fev", matriculas: 62, concluidos: 45, receita: 5800 },
  { month: "Mar", matriculas: 75, concluidos: 61, receita: 7100 },
  { month: "Abr", matriculas: 58, concluidos: 48, receita: 5400 },
  { month: "Mai", matriculas: 89, concluidos: 72, receita: 9200 },
  { month: "Jun", matriculas: 104, concluidos: 88, receita: 11600 },
];

export const CHART_COURSES_PERF = [
  { name: "NR-35", alunos: 342, taxa: 91 },
  { name: "EPI Básico", alunos: 521, taxa: 96 },
  { name: "NR-10", alunos: 198, taxa: 84 },
  { name: "CIPA", alunos: 267, taxa: 89 },
  { name: "NR-12", alunos: 145, taxa: 87 },
  { name: "Primeiros S.", alunos: 389, taxa: 94 },
];

export const MY_COURSES = [
  { id: 1, title: "NR-35: Trabalho em Altura", progress: 62, modules: 12, done: 7, status: "in_progress", image: "photo-1504307651254-35680f356dfd" },
  { id: 2, title: "EPI: Uso e Conservação", progress: 100, modules: 6, done: 6, status: "completed", image: "photo-1565793298595-6a879b1d9492", certId: "EPI-2024-EPI-29301" },
  { id: 3, title: "Primeiros Socorros no Trabalho", progress: 100, modules: 8, done: 8, status: "completed", image: "photo-1559757175-7cb036e0a2d6", certId: "EPI-2024-PS-07513" },
];

export const QUIZ_QUESTIONS = [
  { q: "Qual é a altura mínima a partir da qual um trabalho é considerado 'em altura' pela NR-35?", opts: ["1 metro", "1,5 metro", "2 metros", "3 metros"], correct: 2 },
  { q: "O Equipamento de Proteção Individual (EPI) obrigatório para trabalho em altura é:", opts: ["Capacete simples", "Cinto de segurança tipo paraquedista", "Óculos de proteção", "Luvas de proteção"], correct: 1 },
  { q: "A Análise de Risco (AR) para trabalho em altura deve ser realizada:", opts: ["Apenas no início do contrato", "Uma vez por semana", "Antes de cada atividade ou quando houver mudança", "Somente após acidentes"], correct: 2 },
];
