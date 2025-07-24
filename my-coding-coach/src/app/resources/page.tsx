'use client';

import { BookOpen, ExternalLink, Video, FileText, Code } from 'lucide-react';

const resources = [
    {
        category: 'Python Basics',
        items: [
            {
                title: 'Python Official Documentation',
                description: 'Comprehensive guide to Python programming language',
                url: 'https://docs.python.org/3/',
                type: 'documentation',
                icon: FileText,
            },
            {
                title: 'Python for Beginners',
                description: 'Learn Python programming from scratch',
                url: 'https://www.python.org/about/gettingstarted/',
                type: 'tutorial',
                icon: BookOpen,
            },
        ],
    },
    {
        category: 'Data Structures',
        items: [
            {
                title: 'Python Data Structures',
                description: 'Understanding lists, dictionaries, sets, and tuples',
                url: 'https://docs.python.org/3/tutorial/datastructures.html',
                type: 'documentation',
                icon: FileText,
            },
            {
                title: 'Algorithms and Data Structures',
                description: 'Visual learning platform for algorithms',
                url: 'https://visualgo.net/en',
                type: 'interactive',
                icon: Code,
            },
        ],
    },
    {
        category: 'Object-Oriented Programming',
        items: [
            {
                title: 'Python OOP Tutorial',
                description: 'Learn object-oriented programming in Python',
                url: 'https://realpython.com/python3-object-oriented-programming/',
                type: 'tutorial',
                icon: BookOpen,
            },
        ],
    },
    {
        category: 'Best Practices',
        items: [
            {
                title: 'PEP 8 Style Guide',
                description: 'Python code style guidelines',
                url: 'https://www.python.org/dev/peps/pep-0008/',
                type: 'documentation',
                icon: FileText,
            },
            {
                title: 'Python Best Practices',
                description: 'Video series on Python best practices',
                url: 'https://www.youtube.com/watch?v=wf-BqAjZb8M',
                type: 'video',
                icon: Video,
            },
        ],
    },
];

export default function ResourcesPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Resources</h1>
                    <p className="text-gray-600">
                        Curated resources to help you improve your programming skills
                    </p>
                </div>

                <div className="space-y-8">
                    {resources.map((category) => (
                        <div key={category.category} className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                {category.category}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {category.items.map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={index}
                                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                                        >
                                            <div className="flex items-start mb-3">
                                                <Icon className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 mb-1">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mb-3">
                                                        {item.description}
                                                    </p>
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                    >
                                                        Visit Resource
                                                        <ExternalLink className="h-3 w-3 ml-1" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}