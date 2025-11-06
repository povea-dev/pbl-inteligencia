import { useEffect } from 'react';
import { ChatContainer } from './components/chat/ChatContainer';
import { useChatStore } from './stores/chatStore';
import { firebaseService } from './services/firebaseService';

function App() {
  const { setCurrentProblem, setCurrentSession } = useChatStore();

  useEffect(() => {
    const initializeChat = async () => {
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

      try {
        const sessionId = await firebaseService.createSession(
          'estudiante-test-001',
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
      } catch (error) {
        console.error('Error creando sesión:', error);
      }
    };

    initializeChat();
  }, [setCurrentProblem, setCurrentSession]);

  return (
    <div className="h-screen bg-white">
      <ChatContainer />
    </div>
  );
}

export default App;