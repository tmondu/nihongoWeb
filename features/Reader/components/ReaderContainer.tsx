'use client';

import React from 'react';
import ReaderHeader from './ReaderHeader';
import ReaderArticleSelector from './ReaderArticleSelector';
import ReaderTextViewer from './ReaderTextViewer';
import ReaderWordPopover from './ReaderWordPopover';
import MinedSentencesDrawer from './MinedSentencesDrawer';

export default function ReaderContainer() {
  return (
    <div className='mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8'>
      {/* Top Banner / Header & Controls */}
      <ReaderHeader />

      {/* Preset Articles Grid or Custom Text Area */}
      <ReaderArticleSelector />

      {/* Main Interactive Reader Area */}
      <ReaderTextViewer />

      {/* Modals & Drawers */}
      <ReaderWordPopover />
      <MinedSentencesDrawer />
    </div>
  );
}
