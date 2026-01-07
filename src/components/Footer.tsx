import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white shadow-lg mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="flex space-x-6 mb-4">
            <a href="https://github.com" className="text-gray-400 hover:text-gray-500">
              <Github className="h-6 w-6" />
            </a>
            <a href="https://linkedin.com" className="text-gray-400 hover:text-gray-500">
              <Linkedin className="h-6 w-6" />
            </a>
            <a href="mailto:blockchain@anurag.edu.in" className="text-gray-400 hover:text-gray-500">
              <Mail className="h-6 w-6" />
            </a>
          </div>
          <p className="text-center text-gray-500 text-sm">
            Copyright © 2024 Minukuri Risha Reddy - All Rights Reserved.
          </p>
          <p className="text-center text-gray-400 text-sm mt-1">
            Powered by MRR
          </p>
        </div>
      </div>
    </footer>
  );
}