import { useEffect } from 'react';
import { ChatContainer } from './components/chat/ChatContainer';
import { useChatStore } from './stores/chatStore';
import { firebaseService } from './services/firebaseService';

function App() {
  const { setCurrentProblem, setCurrentSession } = useChatStore();

  useEffect(() => {
    const initializeChat = async () => {
      // Problema de prueba (hardcodeado por ahora)
      const testProblem = {
        id: 'test-problem-1',
        title: 'Optimización de Algoritmos de Búsqueda',
        description: '¿Cómo mejorarías la eficiencia de un algoritmo de búsqueda en un array ordenado? Analiza diferentes enfoques y justifica tu respuesta.',
        category: 'Algoritmos y Estructuras de Datos',
        difficulty: 'medio' as const,
        learningObjectives: [
          'Analizar complejidad algorítmica',
          'Comparar diferentes estrategias de búsqueda',
          'Justificar decisiones técnicas'
        ]
      };

      setCurrentProblem(testProblem);

      // Crear sesión en Firebase
      try {
        const sessionId = await firebaseService.createSession(
          'estudiante-test-001', // En producción, esto vendrá de autenticación
          testProblem.id
        );

        setCurrentSession({
          id: sessionId,
          studentId: 'estudiante-test-001',
          problemId: testProblem.id,
          startedAt: new Date(),
          lastActivityAt: new Date(),
          status: 'active'
        });

        console.log('Sesión creada:', sessionId);
      } catch (error) {
        console.error('Error creando sesión:', error);
      }
    };

    initializeChat();
  }, [setCurrentProblem, setCurrentSession]);

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">PBL Chatbot - IA Educativa</h1>
          <p className="text-sm text-blue-100 mt-1">
            Aprendizaje Basado en Problemas con Inteligencia Artificial
          </p>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <ChatContainer />
      </main>
    </div>
  );
}

export default App;