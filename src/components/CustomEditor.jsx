import React, { useRef, useEffect, useState } from 'react';

const CustomEditor = ({
  value = '',
  onChange,
  placeholder = 'Write your content here...',
  minHeight = '200px',
  className = '',
  disabled = false,
  showToolbar = true,
  toolbarButtons = 'all', // 'all', 'basic', 'minimal', or custom array
  onFocus,
  onBlur,
  allowFullscreen = true,
  ...props
}) => {
  const editorRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Rich text editor functions
  const execCommand = (command, value = null) => {
    if (disabled) return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange?.(content);
    }
  };

  const insertLink = () => {
    if (disabled) return;
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    if (disabled) return;
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const insertTable = () => {
    if (disabled) return;
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    if (rows && cols) {
      let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%;">';
      for (let i = 0; i < parseInt(rows); i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          tableHTML += '<td style="padding: 8px; border: 1px solid #ccc;">Cell</td>';
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</table>';
      execCommand('insertHTML', tableHTML);
    }
  };

  // Fullscreen functionality
  const toggleFullscreen = () => {
    if (disabled) return;
    setIsFullscreen(!isFullscreen);
  };

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  // Handle content changes
  const handleInput = (e) => {
    if (disabled) return;
    const content = e.target.innerHTML;
    onChange?.(content);
  };

  // Handle focus
  const handleFocus = (e) => {
    if (disabled) return;
    onFocus?.(e);
  };

  // Handle blur
  const handleBlur = (e) => {
    if (disabled) return;
    onBlur?.(e);
  };

  // Update content when value prop changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Define toolbar button configurations
  const getToolbarButtons = () => {
    if (Array.isArray(toolbarButtons)) {
      return toolbarButtons;
    }

    const buttonConfigs = {
      basic: [
        { type: 'bold', label: 'B', title: 'Bold' },
        { type: 'italic', label: 'I', title: 'Italic' },
        { type: 'underline', label: 'U', title: 'Underline' },
        { type: 'separator' },
        { type: 'heading', title: 'Heading' },
        { type: 'separator' },
        { type: 'bulletList', label: '• List', title: 'Bullet List' },
        { type: 'numberedList', label: '1. List', title: 'Numbered List' }
      ],
      minimal: [
        { type: 'bold', label: 'B', title: 'Bold' },
        { type: 'italic', label: 'I', title: 'Italic' },
        { type: 'separator' },
        { type: 'heading', title: 'Heading' }
      ],
      all: [
        { type: 'bold', label: 'B', title: 'Bold' },
        { type: 'italic', label: 'I', title: 'Italic' },
        { type: 'underline', label: 'U', title: 'Underline' },
        { type: 'strikethrough', label: 'S', title: 'Strikethrough' },
        { type: 'separator' },
        { type: 'heading', title: 'Heading' },
        { type: 'separator' },
        { type: 'bulletList', label: '• List', title: 'Bullet List' },
        { type: 'numberedList', label: '1. List', title: 'Numbered List' },
        { type: 'separator' },
        { type: 'link', label: '🔗 Link', title: 'Insert Link' },
        { type: 'image', label: '🖼️ Image', title: 'Insert Image' },
        { type: 'table', label: '📊 Table', title: 'Insert Table' },
        { type: 'separator' },
        { type: 'alignLeft', label: '←', title: 'Align Left' },
        { type: 'alignCenter', label: '↔', title: 'Align Center' },
        { type: 'alignRight', label: '→', title: 'Align Right' },
        { type: 'separator' },
        { type: 'removeFormat', label: 'Clear', title: 'Remove Formatting' },
        { type: 'separator' },
        { type: 'fullscreen', label: isFullscreen ? '⤓ Exit' : '⤢ Fullscreen', title: isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen' }
      ]
    };

    return buttonConfigs[toolbarButtons] || buttonConfigs.all;
  };

  const renderToolbarButton = (button) => {
    if (button.type === 'separator') {
      return <div key={Math.random()} className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>;
    }

    if (button.type === 'heading') {
      return (
        <select
          key={button.type}
          onChange={(e) => execCommand('formatBlock', e.target.value)}
          className="px-2 py-1 text-sm bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 rounded"
          title={button.title}
          disabled={disabled}
        >
          <option value="p">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>
      );
    }

    const buttonActions = {
      bold: () => execCommand('bold'),
      italic: () => execCommand('italic'),
      underline: () => execCommand('underline'),
      strikethrough: () => execCommand('strikeThrough'),
      bulletList: () => execCommand('insertUnorderedList'),
      numberedList: () => execCommand('insertOrderedList'),
      link: insertLink,
      image: insertImage,
      table: insertTable,
      alignLeft: () => execCommand('justifyLeft'),
      alignCenter: () => execCommand('justifyCenter'),
      alignRight: () => execCommand('justifyRight'),
      removeFormat: () => execCommand('removeFormat'),
      fullscreen: toggleFullscreen
    };

    return (
      <button
        key={button.type}
        type="button"
        onClick={buttonActions[button.type]}
        className="px-2 py-1 text-sm bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        title={button.title}
        disabled={disabled}
      >
        {button.label}
      </button>
    );
  };

  const editorContent = (
    <>
      {showToolbar && (
        <div className={`toolbar bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 p-2 flex flex-wrap gap-1 ${isFullscreen ? 'sticky' : ''}`}>
          {getToolbarButtons().map(renderToolbarButton)}
        </div>
      )}
      
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="editor p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
        style={{ minHeight: isFullscreen ? 'calc(100vh - 60px)' : minHeight }}
        suppressContentEditableWarning={true}
        {...props}
      />
    </>
  );

  if (isFullscreen) {
    return (
      <div className="rich-text-editor fullscreen">
        {editorContent}
      </div>
    );
  }

  return (
    <div className={`rich-text-editor border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden ${className}`}>
      {editorContent}
    </div>
  );
};

export default CustomEditor;
