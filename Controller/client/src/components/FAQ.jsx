import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook for navigation
import './FAQ.css';

/**
 * Represents a single FAQ item with expandable/collapsible functionality.
 *
 * @param {Object} props - Component properties
 * @param {string} props.question - The question for the FAQ item
 * @param {string} props.answer - The answer to the FAQ question
 * @param {number} props.id - Unique ID for the FAQ item
 * @param {number|null} props.expanded - ID of the currently expanded FAQ item
 * @param {Function} props.setExpanded - Function to set the expanded item
 * @returns {JSX.Element} A FAQ item with clickable question that expands to show the answer
 */
const FAQItem = ({ question, answer, id, expanded, setExpanded }) => {
  const handleClick = () => {
    setExpanded(expanded === id ? null : id); // Toggle between expanded and collapsed state
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <button
            className={`btn btn-link ${expanded !== id && 'collapsed'}`}
            type="button"
            onClick={handleClick}
            aria-expanded={expanded === id}
          >
            {question}
          </button>
        </h5>
      </div>
      <div className={`collapse ${expanded === id && 'show'}`} aria-labelledby="headingOne">
        <div className="card-body">{answer}</div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [expanded, setExpanded] = useState(null); // Track which item is expanded
  const navigate = useNavigate(); // Initialize navigate function

  const faqs = [
    {
      id: 1,
      question: "What is CIS-3500?",
      answer: "CIS-3500, often part of a Computer Science or Information Systems curriculum, focuses on advanced topics in software development, algorithms, and system design. It typically covers areas like data structures, complexity analysis, software engineering principles, and possibly an introduction to machine learning or AI technologies. This course aims to prepare students for real-world software development challenges and enhance their problem-solving skills.",
    },
    {
        id: 2,
        question: "How can the AI chatbot help me with CIS-3500?",
        answer: "The AI chatbot is designed to assist you in several ways. Firstly, it can provide explanations and resources on specific topics covered in the CIS-3500 curriculum, such as data structures, algorithms, and software engineering principles. Secondly, it can offer coding tips and best practices to help you write more efficient and readable code. Thirdly, it can answer frequently asked questions related to the course content and assignments. Finally, the chatbot can guide you through troubleshooting common issues that students face in their projects or assignments.",
      },
      {
        id: 3,
        question: "Is the AI chatbot service free to use?",
        answer: "Yes, the AI chatbot service is completely free to use for all students enrolled in CIS-3500. Our goal is to provide an accessible educational tool that supports students in their learning process, offering immediate assistance and resources without any cost. We believe in promoting an inclusive learning environment where every student has the tools they need to succeed in their studies.",
      },
      {
        id: 4,
        question: "How do I interact with the AI chatbot?",
        answer: "Interacting with the AI chatbot is simple. You can start by typing your question or the topic you need help with into the chat interface. The chatbot will then respond with information, resources, or follow-up questions to narrow down your inquiry. For the best experience, be as specific as possible with your questions. If the chatbot provides an answer that isn't clear or you need further explanation, feel free to ask more detailed questions or request examples.",
      },
      {
        id: 5,
        question: "Can the AI chatbot help with specific coding problems?",
        answer: "Yes, the AI chatbot can assist with specific coding problems by offering debugging tips, suggesting best practices, and providing examples of similar coding scenarios. However, it's important to note that while the chatbot can guide you towards solving your problem, it's designed to enhance learning rather than directly solving assignments for you. For complex issues or detailed code reviews, it may recommend consulting additional resources or seeking help from a tutor.",
      },

  ];

  return (
    <section className="faq">
        <div className="container">
            <div className="row justify-content-between align-items-center mb-4">
                <div className="col text-center">
                    <h1>Frequently Asked Questions</h1>
                </div>
                <div className="col-auto">
                    <button className="btn btn-primary" onClick={() => navigate('/chat')}>Back to Chat</button>
                </div>
            </div>
            <div className="row">
                <div className="col-xl-12 col-lg-12">
                    <div className="accordion">
                        {faqs.map(faq => (
                          <FAQItem
                            key={faq.id}
                            id={faq.id}
                            question={faq.question}
                            answer={faq.answer}
                            expanded={expanded}
                            setExpanded={setExpanded}
                          />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};


export default FAQ;