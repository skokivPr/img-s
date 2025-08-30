 // === GLOBAL STATE ===
        let monacoEditor;
        let pendingAction = null;
        let isDarkTheme = localStorage.getItem('theme') === 'dark' || false;

        // === INITIALIZATION ===
        document.addEventListener('DOMContentLoaded', function () {
            console.log('🚀 Generator Grafik - Inicjalizacja...');

            initializeTheme();
            initializeGraphicsMode();

            console.log('✅ Generator Grafik gotowy do użycia!');
        });

        // === THEME MANAGEMENT ===
        function initializeTheme() {
            const themeToggle = document.getElementById('theme-toggle');
            const sunIcon = document.getElementById('sunIcon');
            const moonIcon = document.getElementById('moonIcon');

            applyTheme(isDarkTheme);

            themeToggle.addEventListener('click', function () {
                isDarkTheme = !isDarkTheme;
                localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
                applyTheme(isDarkTheme);
            });

            function applyTheme(dark) {
                const root = document.documentElement;
                if (dark) {
                    root.setAttribute('theme', 'dark');
                } else {
                    root.removeAttribute('theme');
                }
                sunIcon.style.display = dark ? 'none' : 'inline-block';
                moonIcon.style.display = dark ? 'inline-block' : 'none';

                // Update Monaco Editor theme
                if (monacoEditor && monaco) {
                    monaco.editor.setTheme(dark ? 'vs-dark' : 'vs');
                }
            }
        }

        // === GRAPHICS MODE ===
        function initializeGraphicsMode() {
            // Initialize Monaco Editor
            require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.41.0/min/vs' } });
            require(['vs/editor/editor.main'], function () {
                const initialTheme = isDarkTheme ? 'vs-dark' : 'vs';

                monacoEditor = monaco.editor.create(document.getElementById('editor-container'), {
                    value: `# 🎯 Generator Grafik - Monaco Editor

## Zaawansowane funkcje
- **Monaco Editor** - Profesjonalny edytor kodu z syntax highlighting
- **Rich Toolbar** - 25+ przycisków formatowania z Font Awesome icons
- **Smart Modals** - Ikony, obrazy, inteligentne formatowanie
- **Live Preview** - Podgląd na żywo z kolorowymi elementami

## ✨ Przykład formatowania

## Tekst z ikonami
✅ **Sukces** - zadanie ukończone
⏳ **W trakcie** - prace w realizacji  
❌ **Błąd** - wymaga naprawy
🔥 **Priorytet** - ważne zadanie

## Kolorowe kroki
[#1] Analiza wymagań | Przeanalizuj wszystkie wymagania projektu
[#2] Projektowanie | Stwórz mockupy i wireframes  
[#3] Implementacja | Napisz kod według specyfikacji
[#4] Testowanie | Przetestuj wszystkie funkcjonalności

[INFO] Używaj zaawansowanego toolbara do szybkiego formatowania!

## Przykład obrazu
![Demo](https://picsum.photos/seed/monaco/600/300)

**Inteligentne funkcje:**
- **Magic Wand** <i class="fa-solid fa-magic-wand-sparkles"></i> - automatyczne formatowanie tekstu
- **Icons Picker** <i class="fa-solid fa-icons"></i> - Font Awesome + Unicode icons
- **Smart Images** <i class="fa-solid fa-image"></i> - z live preview i walidacją
- **Word Counter** - live counting w prawym dolnym rogu

**Link do dokumentacji:** [Monaco Editor](https://microsoft.github.io/monaco-editor/)

---

*Stwórz profesjonalne grafiki z Monaco Editor! 🚀*`,
                    language: 'markdown',
                    theme: initialTheme,
                    automaticLayout: true,
                    wordWrap: 'on',
                    minimap: { enabled: false },
                    lineNumbers: 'off',
                    folding: false,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 0
                });

                // Live preview with debounce
                let debounceTimer;
                monacoEditor.onDidChangeModelContent(() => {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        updatePreview();
                        updateWordCounter();
                    }, 300);
                });

                // Initial update
                updatePreview();
                updateWordCounter();
                createFormatLegend();
            });

            // Initialize event handlers
            const toolbar = document.querySelector('.toolbar');

            if (toolbar) {
                toolbar.addEventListener('click', (e) => {
                    const button = e.target.closest('button');
                    if (button && button.dataset.action) {
                        handleToolbarAction(button);
                    }
                });
            }
        }

        // === TOOLBAR ACTIONS ===
        function handleToolbarAction(button) {
            if (!monacoEditor) return;

            const action = button.dataset.action;
            const value = button.dataset.value;
            const caseType = button.dataset.case;
            const selection = monacoEditor.getSelection();

            switch (action) {
                case 'insert':
                    monacoEditor.executeEdits('toolbar-action', [{
                        range: selection,
                        text: value,
                        forceMoveMarkers: true
                    }]);
                    break;

                case 'wrap':
                    const selectedText = monacoEditor.getModel().getValueInRange(selection);
                    let endTag = value;
                    if (value.startsWith('<span')) endTag = '</span>';
                    else if (value.startsWith('<div')) endTag = '</div>';
                    else if (value.startsWith('<u>')) endTag = '</u>';
                    const replacement = value + selectedText + endTag;
                    monacoEditor.executeEdits('toolbar-action', [{
                        range: selection,
                        text: replacement,
                        forceMoveMarkers: true
                    }]);
                    break;

                case 'case':
                    if (selection.isEmpty()) return;
                    const text = monacoEditor.getModel().getValueInRange(selection);
                    let newText = text;
                    if (caseType === 'upper') newText = text.toUpperCase();
                    else if (caseType === 'lower') newText = text.toLowerCase();
                    else if (caseType === 'capitalize') newText = text.toLowerCase().replace(/(^|\s)\S/g, (L) => L.toUpperCase());
                    monacoEditor.executeEdits('case-change', [{
                        range: selection,
                        text: newText,
                        forceMoveMarkers: true
                    }]);
                    break;

                case 'insert-table':
                    insertTable();
                    break;
                case 'insert-link':
                    insertLink();
                    break;
                case 'show-icons':
                    showIconsModal();
                    break;
                case 'show-image':
                    showImageModal();
                    break;
                case 'undo':
                    monacoEditor.trigger('keyboard', 'undo', null);
                    break;
                case 'redo':
                    monacoEditor.trigger('keyboard', 'redo', null);
                    break;
                case 'clear':
                    pendingAction = () => {
                        monacoEditor.setValue('');
                        monacoEditor.focus();
                        updateWordCounter();
                    };
                    showConfirmModal();
                    return;
                case 'format-text':
                    showFormatModal();
                    return;
            }

            monacoEditor.focus();
            updateWordCounter();
        }

        function updatePreview() {
            const preview = document.getElementById('preview');

            if (!monacoEditor || !preview) return;

            const markdown = monacoEditor.getValue();
            const html = parseAdvancedMarkdown(markdown);
            preview.innerHTML = html;
        }

        function parseAdvancedMarkdown(text) {
            let processedText = text
                // Basic formatting first
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
                .replace(/<u>([^<]+)<\/u>/g, '<u>$1</u>')
                .replace(/~~([^~]+)~~/g, '<s>$1</s>')
                // Images - must be before inline code
                .replace(/!\[([^\]]*)\]\(([^)]*)\)/g, '<img src="$2" alt="$1" class="content-image" loading="lazy" />')
                // Links
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
                // Inline code
                .replace(/`([^`]+)`/g, '<code style="background-color: var(--card-bg); padding: 0.2rem 0.4rem; border-radius: 0px; font-family: monospace;">$1</code>');

            let html = '<div class="preview-content">';
            let listOpen = false;
            let orderedListOpen = false;
            let tableOpen = false;
            let blockquoteOpen = false;

            const lines = processedText.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmedLine = line.trim();

                // Close lists if needed
                const isListItem = trimmedLine.startsWith('- ');
                const isOrderedListItem = /^\d+\.\s/.test(trimmedLine);
                const isTableRow = trimmedLine.startsWith('|') && trimmedLine.endsWith('|');
                const isBlockquote = trimmedLine.startsWith('> ');

                // Handle list transitions
                if (isListItem && !listOpen) {
                    if (orderedListOpen) { html += '</ol>'; orderedListOpen = false; }
                    html += '<ul>'; listOpen = true;
                }
                if (isOrderedListItem && !orderedListOpen) {
                    if (listOpen) { html += '</ul>'; listOpen = false; }
                    html += '<ol>'; orderedListOpen = true;
                }
                if (!isListItem && listOpen) { html += '</ul>'; listOpen = false; }
                if (!isOrderedListItem && orderedListOpen) { html += '</ol>'; orderedListOpen = false; }

                // Handle table transitions
                if (isTableRow && !tableOpen) {
                    html += '<table style="width: 100%; border-collapse: collapse; margin: 1rem 0;"><tbody>';
                    tableOpen = true;
                }
                if (!isTableRow && tableOpen) {
                    html += '</tbody></table>';
                    tableOpen = false;
                }

                // Handle blockquote transitions
                if (isBlockquote && !blockquoteOpen) {
                    html += '<blockquote style="border-left: 4px solid var(--highlight-color); padding-left: 1rem; margin: 1rem 0; font-style: italic; color: var(--text-muted);">';
                    blockquoteOpen = true;
                }
                if (!isBlockquote && blockquoteOpen) {
                    html += '</blockquote>';
                    blockquoteOpen = false;
                }

                // Skip empty lines except in special contexts
                if (trimmedLine === '' && !listOpen && !orderedListOpen && !tableOpen && !blockquoteOpen) continue;

                // Process different line types
                if (isListItem) {
                    html += '<li>' + trimmedLine.substring(2) + '</li>';
                }
                else if (isOrderedListItem) {
                    html += '<li>' + trimmedLine.replace(/^\d+\.\s/, '') + '</li>';
                }
                else if (isTableRow) {
                    // Simple table processing
                    const cells = trimmedLine.slice(1, -1).split('|');
                    const isHeaderSeparator = trimmedLine.includes('---');

                    if (!isHeaderSeparator) {
                        html += '<tr>';
                        cells.forEach(cell => {
                            const cellContent = cell.trim();
                            html += '<td style="border: 1px solid var(--border-color); padding: 0.5rem;">' + cellContent + '</td>';
                        });
                        html += '</tr>';
                    }
                }
                else if (isBlockquote) {
                    html += '<p>' + trimmedLine.substring(2) + '</p>';
                }
                else if (line.startsWith('# ')) {
                    html += '<h1 style="color: var(--highlight-color); display: flex; align-items: center; gap: 0.5rem;"><i class="fa-solid fa-star" style="color: #ff0000;"></i>' + line.substring(2) + '<i class="fa-solid fa-star" style="color: #ff0000;"></i></h1>';
                }
                else if (line.startsWith('## ')) {
                    html += '<h2 style="color: var(--highlight-color);">' + line.substring(3) + '</h2>';
                }
                else if (line.startsWith('### ')) {
                    html += '<h3 style="color: var(--text-color); font-size: 1.1rem; font-weight: 700; margin: 0.75rem 0 0.5rem 0; border-left: 3px solid var(--highlight-color); padding-left: 0.75rem;">' + line.substring(4) + '</h3>';
                }
                else if (line.startsWith('[INFO] ')) {
                    html += '<div class="info-box" style="background-color: var(--card-bg); padding: 1rem; border: 1px solid var(--border-color); margin: 0.5rem 0; border-left: 4px solid var(--highlight-color); display: flex; align-items: center;"><i class="fa-solid fa-info-circle" style="color: var(--highlight-color); margin-right: 0.5rem; font-size: 1.5rem;"></i>' + line.substring(7) + '</div>';
                }
                else if (trimmedLine === '---' || trimmedLine === '**' || trimmedLine === '___') {
                    html += '<hr style="border: 0; height: 3px; background: linear-gradient(90deg, var(--highlight-color), var(--text-muted), var(--highlight-color)); margin: 2rem 0; border-radius: 0px;">';
                }
                else {
                    // Handle step boxes
                    const stepMatch = line.match(/^\[#(\d+)\] (.*?) \| (.*)/);
                    if (stepMatch) {
                        const [_, stepNum, title, description] = stepMatch;
                        let iconClass = '';

                        if (stepNum === '1') {
                            iconClass = 'fa-solid fa-info-circle';
                        }
                        else if (stepNum === '2') {
                            iconClass = 'fa-solid fa-lightbulb';
                        }
                        else if (stepNum === '3') {
                            iconClass = 'fa-solid fa-triangle-exclamation';
                        }
                        else if (stepNum === '4') {
                            iconClass = 'fa-solid fa-circle-exclamation';
                        }

                        html += '<div class="step-box step-box-' + stepNum + '"><div class="icon"><i class="' + iconClass + '"></i></div><div class="text-content"><div class="title">#' + stepNum + ': ' + title + '</div><div class="description">' + description + '</div></div></div>';
                    }
                    else if (trimmedLine !== '') {
                        html += '<p>' + line + '</p>';
                    }
                }
            }

            // Close any remaining open tags
            if (listOpen) html += '</ul>';
            if (orderedListOpen) html += '</ol>';
            if (tableOpen) html += '</tbody></table>';
            if (blockquoteOpen) html += '</blockquote>';

            html += '</div>';
            return html;
        }

        function exportGraphicsAsPng() {
            const preview = document.getElementById('preview');

            if (!preview || !html2canvas) {
                alert('❌ Błąd: Nie można załadować biblioteki exportu');
                return;
            }

            // Debug: sprawdź czy preview ma zawartość
            if (!preview.innerHTML || preview.innerHTML.trim() === '' || preview.innerHTML.includes('<!-- Preview będzie tutaj generowany -->')) {
                alert('❌ Błąd: Preview jest pusty!\n\n✅ Rozwiązanie:\n1. Wpisz tekst w edytorze Monaco\n2. Sprawdź czy Live Preview się wyświetla\n3. Spróbuj ponownie');
                return;
            }

            // Otwórz modal z opcjami exportu
            showPngExportModal();
        }

        function actualPngExport(mode) {
            const preview = document.getElementById('preview');
            const button = document.getElementById('exportGraphicsPng');

            const originalText = button.innerHTML;
            button.innerHTML = '⏳ Eksportuje...';
            button.disabled = true;
            button.classList.add('loading');

            const isCurrentlyDark = document.documentElement.getAttribute('theme') === 'dark';

            // Poczekaj na pełne renderowanie
            setTimeout(() => {
                // Stwórz tymczasowy element do renderowania z lepszym CSS
                const tempDiv = document.createElement('div');
                tempDiv.style.cssText = `
                    position: absolute;
                    top: -9999px;
                    left: -9999px;
                    width: 900px;
                    min-height: 600px;
                    padding: 3rem;
                    background-color: ${isCurrentlyDark ? '#0a0a0a' : '#ffffff'};
                    color: ${isCurrentlyDark ? '#f0f0f0' : '#1a1a1a'};
                    font-family: "JetBrains Mono", "Fira Code", "Source Code Pro", "Share Tech Mono", monospace;
                    font-size: 18px;
                    line-height: 1.8;
                    font-weight: 500;
                    border: none;
                    box-shadow: none;
                    overflow: visible;
                `;

                // Skopiuj zawartość preview i zamień CSS zmienne na stałe wartości
                let content = preview.innerHTML;

                // Zastąp CSS zmienne rzeczywistymi kolorami - RGB System
                if (isCurrentlyDark) {
                    content = content
                        // Base colors - Dark Theme
                        .replace(/rgb\(var\(--highlight-rgb\)\)/g, 'rgb(255, 115, 0)')
                        .replace(/rgb\(var\(--text-color-rgb\)\)/g, 'rgb(240, 240, 240)')
                        .replace(/rgb\(var\(--text-muted-rgb\)\)/g, 'rgb(176, 176, 176)')
                        .replace(/rgb\(var\(--card-bg-rgb\)\)/g, 'rgb(42, 42, 42)')
                        .replace(/rgb\(var\(--border-color-rgb\)\)/g, 'rgb(64, 64, 64)')
                        .replace(/rgba\(var\(--highlight-rgb\), 0\.1\)/g, 'rgba(255, 115, 0, 0.1)')
                        .replace(/rgba\(var\(--border-color-rgb\), 0\.\d+\)/g, 'rgba(64, 64, 64, 0.3)')
                        // Step Box Colors - Dark Theme
                        .replace(/rgb\(var\(--step1-bg-rgb\)\)/g, 'rgb(26, 54, 93)')
                        .replace(/rgb\(var\(--step1-text-rgb\)\)/g, 'rgb(230, 255, 250)')
                        .replace(/rgb\(var\(--step1-accent-rgb\)\)/g, 'rgb(99, 179, 237)')
                        .replace(/rgb\(var\(--step2-bg-rgb\)\)/g, 'rgb(26, 32, 44)')
                        .replace(/rgb\(var\(--step2-text-rgb\)\)/g, 'rgb(198, 246, 213)')
                        .replace(/rgb\(var\(--step2-accent-rgb\)\)/g, 'rgb(104, 211, 145)')
                        .replace(/rgb\(var\(--step3-bg-rgb\)\)/g, 'rgb(116, 66, 16)')
                        .replace(/rgb\(var\(--step3-text-rgb\)\)/g, 'rgb(250, 240, 137)')
                        .replace(/rgb\(var\(--step3-accent-rgb\)\)/g, 'rgb(246, 224, 94)')
                        .replace(/rgb\(var\(--step4-bg-rgb\)\)/g, 'rgb(116, 42, 42)')
                        .replace(/rgb\(var\(--step4-text-rgb\)\)/g, 'rgb(254, 215, 215)')
                        .replace(/rgb\(var\(--step4-accent-rgb\)\)/g, 'rgb(252, 129, 129)');
                } else {
                    content = content
                        // Base colors - Light Theme
                        .replace(/rgb\(var\(--highlight-rgb\)\)/g, 'rgb(255, 115, 0)')
                        .replace(/rgb\(var\(--text-color-rgb\)\)/g, 'rgb(26, 26, 26)')
                        .replace(/rgb\(var\(--text-muted-rgb\)\)/g, 'rgb(74, 74, 74)')
                        .replace(/rgb\(var\(--card-bg-rgb\)\)/g, 'rgb(250, 250, 250)')
                        .replace(/rgb\(var\(--border-color-rgb\)\)/g, 'rgb(208, 208, 208)')
                        .replace(/rgba\(var\(--highlight-rgb\), 0\.1\)/g, 'rgba(255, 115, 0, 0.1)')
                        .replace(/rgba\(var\(--border-color-rgb\), 0\.\d+\)/g, 'rgba(208, 208, 208, 0.3)')
                        // Step Box Colors - Light Theme
                        .replace(/rgb\(var\(--step1-bg-rgb\)\)/g, 'rgb(240, 248, 255)')
                        .replace(/rgb\(var\(--step1-text-rgb\)\)/g, 'rgb(26, 54, 93)')
                        .replace(/rgb\(var\(--step1-accent-rgb\)\)/g, 'rgb(49, 130, 206)')
                        .replace(/rgb\(var\(--step2-bg-rgb\)\)/g, 'rgb(240, 255, 244)')
                        .replace(/rgb\(var\(--step2-text-rgb\)\)/g, 'rgb(26, 32, 44)')
                        .replace(/rgb\(var\(--step2-accent-rgb\)\)/g, 'rgb(56, 161, 105)')
                        .replace(/rgb\(var\(--step3-bg-rgb\)\)/g, 'rgb(255, 253, 240)')
                        .replace(/rgb\(var\(--step3-text-rgb\)\)/g, 'rgb(116, 66, 16)')
                        .replace(/rgb\(var\(--step3-accent-rgb\)\)/g, 'rgb(214, 158, 46)')
                        .replace(/rgb\(var\(--step4-bg-rgb\)\)/g, 'rgb(255, 245, 245)')
                        .replace(/rgb\(var\(--step4-text-rgb\)\)/g, 'rgb(116, 42, 42)')
                        .replace(/rgb\(var\(--step4-accent-rgb\)\)/g, 'rgb(229, 62, 62)');
                }

                tempDiv.innerHTML = content;

                // Dodaj dodatkowe style dla lepszego renderowania
                const styleSheet = document.createElement('style');
                styleSheet.textContent = `
                    .preview-content h1 {
                        color: #ff7300 !important;
                        font-size: 1.4rem !important;
                        font-weight: 900 !important;
                        margin: 0.5rem 0 0.5rem 0 !important;
                        display: flex !important;
                        align-items: center !important;
                        gap: 0.5rem !important;
                    }
                    .preview-content h2 {
                        color: ${isCurrentlyDark ? '#f0f0f0' : '#1a1a1a'} !important;
                        font-size: 1.2rem !important;
                        font-weight: 900 !important;
                        margin: 0.5rem 0 0.5rem 0 !important;
                    }
                    .preview-content h3 {
                        color: ${isCurrentlyDark ? '#f0f0f0' : '#1a1a1a'} !important;
                        font-size: 1.1rem !important;
                        font-weight: 700 !important;
                        margin: 0.75rem 0 0.5rem 0 !important;
                        border-left: 3px solid #ff7300 !important;
                        padding-left: 0.75rem !important;
                    }
                    .preview-content p {
                        margin: 0.5rem 0 !important;
                        font-size: 14px !important;
                        font-weight: 500 !important;
                        line-height: 1.5 !important;
                    }
                    .preview-content strong {
                        font-weight: 900 !important;
                    }
                    .preview-content em {
                        font-weight: 600 !important;
                        font-style: italic !important;
                    }
                    
                    /* Step Box Styles for PNG Export */
                    .step-box {
                        display: flex !important;
                        align-items: flex-start !important;
                        gap: 1rem !important;
                        padding: 1rem !important;
                        margin: 1rem 0 !important;
                        border: 2px solid ${isCurrentlyDark ? '#404040' : '#d0d0d0'} !important;
                    }
                    
                    .step-box-1 {
                        background-color: ${isCurrentlyDark ? '#1a365d' : '#f0f8ff'} !important;
                        color: ${isCurrentlyDark ? '#e6fffa' : '#1a365d'} !important;
                        border-left: 5px solid ${isCurrentlyDark ? '#63b3ed' : '#3182ce'} !important;
                    }
                    
                    .step-box-2 {
                        background-color: ${isCurrentlyDark ? '#1a202c' : '#f0fff4'} !important;
                        color: ${isCurrentlyDark ? '#c6f6d5' : '#1a202c'} !important;
                        border-left: 5px solid ${isCurrentlyDark ? '#68d391' : '#38a169'} !important;
                    }
                    
                    .step-box-3 {
                        background-color: ${isCurrentlyDark ? '#744210' : '#fffdf0'} !important;
                        color: ${isCurrentlyDark ? '#faf089' : '#744210'} !important;
                        border-left: 5px solid ${isCurrentlyDark ? '#f6e05e' : '#d69e2e'} !important;
                    }
                    
                    .step-box-4 {
                        background-color: ${isCurrentlyDark ? '#742a2a' : '#fff5f5'} !important;
                        color: ${isCurrentlyDark ? '#fed7d7' : '#742a2a'} !important;
                        border-left: 5px solid ${isCurrentlyDark ? '#fc8181' : '#e53e3e'} !important;
                    }
                    
                    .step-box .icon {
                        width: 2.5rem !important;
                        height: 2.5rem !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        border-radius: 0% !important;
                        font-size: 1.1rem !important;
                        font-weight: 900 !important;
                        flex-shrink: 0 !important;
                    }
                    
                    .step-box-1 .icon {
                        background-color: ${isCurrentlyDark ? '#63b3ed' : '#3182ce'} !important;
                        color: #ffffff !important;
                    }
                    
                    .step-box-2 .icon {
                        background-color: ${isCurrentlyDark ? '#68d391' : '#38a169'} !important;
                        color: #ffffff !important;
                    }
                    
                    .step-box-3 .icon {
                        background-color: ${isCurrentlyDark ? '#f6e05e' : '#d69e2e'} !important;
                        color: #000000 !important;
                    }
                    
                    .step-box-4 .icon {
                        background-color: ${isCurrentlyDark ? '#fc8181' : '#e53e3e'} !important;
                        color: #ffffff !important;
                    }
                    
                    .step-box .title {
                        font-weight: 900 !important;
                        font-size: 1rem !important;
                        margin-bottom: 0.5rem !important;
                        line-height: 1.3 !important;
                    }
                    
                    .step-box .description {
                        font-size: 0.9rem !important;
                        font-weight: 500 !important;
                        line-height: 1.4 !important;
                        opacity: 0.9 !important;
                    }
                `;
                tempDiv.appendChild(styleSheet);

                // Dodaj do DOM
                document.body.appendChild(tempDiv);

                // Renderuj z html2canvas z lepszymi opcjami
                html2canvas(tempDiv, {
                    backgroundColor: isCurrentlyDark ? '#0a0a0a' : '#ffffff',
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    width: 900,
                    height: Math.max(600, tempDiv.scrollHeight),
                    windowWidth: 900,
                    windowHeight: Math.max(600, tempDiv.scrollHeight),
                    scrollX: 0,
                    scrollY: 0,
                    ignoreElements: function (element) {
                        // Ignoruj niektóre problematyczne elementy
                        return element.tagName === 'SCRIPT' || element.tagName === 'NOSCRIPT';
                    }
                }).then(canvas => {
                    // Usuń tymczasowy element
                    document.body.removeChild(tempDiv);

                    // Sprawdź czy canvas ma zawartość
                    if (canvas.width === 0 || canvas.height === 0) {
                        throw new Error('Canvas jest pusty - brak zawartości do renderowania');
                    }

                    // Obsłuż wybraną opcję
                    const dataUrl = canvas.toDataURL('image/png', 1.0);

                    if (mode === 'download') {
                        // Pobierz plik
                        const link = document.createElement('a');
                        link.download = 'grafika-' + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.png';
                        link.href = dataUrl;
                        link.click();

                        button.innerHTML = '✅ Pobrano!';
                        setTimeout(() => {
                            button.innerHTML = originalText;
                            button.disabled = false;
                            button.classList.remove('loading');
                        }, 2000);
                    } else if (mode === 'newtab') {
                        // Otwórz w nowej zakładce - używamy Blob URL dla lepszej kompatybilności
                        try {
                            // Konwertuj data URL do Blob
                            const base64Data = dataUrl.split(',')[1];
                            const byteCharacters = atob(base64Data);
                            const byteNumbers = new Array(byteCharacters.length);
                            for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            const blob = new Blob([byteArray], { type: 'image/png' });

                            // Stwórz Blob URL
                            const blobUrl = URL.createObjectURL(blob);

                            // Otwórz w nowej zakładce
                            console.log('🌐 Tworzę Blob URL i otwieram nową zakładkę...');
                            const newTab = window.open(blobUrl, '_blank');

                            if (newTab && !newTab.closed) {
                                console.log('✅ Nowa zakładka otwarta pomyślnie!');
                                button.innerHTML = '✅ Otworzono!';
                                // Zwolnij pamięć po 10 sekundach
                                setTimeout(() => {
                                    URL.revokeObjectURL(blobUrl);
                                    console.log('🗑️ Blob URL zwolniony z pamięci');
                                }, 10000);
                            } else {
                                console.warn('❌ Popup zablokowany przez przeglądarkę');
                                // Fallback do pobrania jeśli popup został zablokowany
                                throw new Error('Popup zablokowany przez przeglądarkę');
                            }

                            setTimeout(() => {
                                button.innerHTML = originalText;
                                button.disabled = false;
                                button.classList.remove('loading');
                            }, 2000);
                        } catch (error) {
                            console.warn('Nie można otworzyć w nowej zakładce:', error.message);
                            // Fallback - pobierz plik
                            const link = document.createElement('a');
                            link.download = 'grafika-' + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.png';
                            link.href = dataUrl;
                            link.click();

                            button.innerHTML = '✅ Pobrano! (popup zablokowany)';
                            setTimeout(() => {
                                button.innerHTML = originalText;
                                button.disabled = false;
                                button.classList.remove('loading');
                            }, 3000);
                        }
                    }
                }).catch(err => {
                    console.error('Błąd eksportu:', err);
                    // Usuń tymczasowy element w przypadku błędu
                    if (tempDiv && document.body.contains(tempDiv)) {
                        document.body.removeChild(tempDiv);
                    }

                    button.innerHTML = '❌ Błąd';
                    alert('❌ Błąd eksportu PNG!\n\n📋 Szczegóły: ' + err.message + '\n\n💡 Spróbuj:\n1. Odśwież stronę i spróbuj ponownie\n2. Sprawdź czy w Live Preview wyświetla się zawartość\n3. Spróbuj w innej przeglądarce');
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.disabled = false;
                        button.classList.remove('loading');
                    }, 3000);
                });
            }, 800); // Zwiększony timeout dla lepszego renderowania
        }

        // === HELPER FUNCTIONS ===
        function insertTable() {
            showTableModal();
        }

        // Table Modal Functions
        const tableModal = document.getElementById('tableModal');

        function showTableModal() {
            if (tableModal) {
                tableModal.classList.add('show');
                // Reset to basic tab
                switchTableTab('basic');
                // If there's selected text, try to populate the text-to-table field
                if (monacoEditor) {
                    const selection = monacoEditor.getModel().getValueInRange(monacoEditor.getSelection());
                    if (selection.trim()) {
                        switchTableTab('fromtext');
                        document.getElementById('textToTable').value = selection;
                    }
                }
            }
        }

        function hideTableModal() {
            if (tableModal) {
                tableModal.classList.remove('show');
            }
        }

        function switchTableTab(tab) {
            const basicOptions = document.getElementById('basicTableOptions');
            const textOptions = document.getElementById('textTableOptions');
            const basicTab = document.getElementById('tabBasic');
            const textTab = document.getElementById('tabFromText');

            if (tab === 'basic') {
                basicOptions.style.display = 'block';
                textOptions.style.display = 'none';
                basicTab.classList.add('active');
                textTab.classList.remove('active');
            } else {
                basicOptions.style.display = 'none';
                textOptions.style.display = 'block';
                basicTab.classList.remove('active');
                textTab.classList.add('active');
            }
        }

        function generateTable() {
            const basicOptions = document.getElementById('basicTableOptions');
            const isBasicMode = basicOptions.style.display !== 'none';

            let tableMarkdown = '';

            if (isBasicMode) {
                // Generate basic table
                const cols = parseInt(document.getElementById('tableColumns').value) || 3;
                const rows = parseInt(document.getElementById('tableRows').value) || 3;
                const hasHeader = document.getElementById('tableHeader').checked;

                tableMarkdown = generateBasicTable(cols, rows, hasHeader);
            } else {
                // Generate table from text
                const text = document.getElementById('textToTable').value.trim();
                const separator = document.getElementById('textSeparator').value;
                const hasHeader = document.getElementById('textTableHeader').checked;

                if (!text) {
                    alert('Proszę wprowadzić tekst do przekształcenia w tabelę.');
                    return;
                }

                tableMarkdown = generateTableFromText(text, separator, hasHeader);
            }

            // Insert table into editor
            if (monacoEditor && tableMarkdown) {
                const selection = monacoEditor.getSelection();
                monacoEditor.executeEdits('toolbar-action', [{
                    range: selection,
                    text: '\n' + tableMarkdown + '\n\n',
                    forceMoveMarkers: true
                }]);
                monacoEditor.focus();
                updateWordCounter();
            }

            hideTableModal();
        }

        function generateBasicTable(cols, rows, hasHeader) {
            let table = '';

            // Generate header row
            let headerRow = '|';
            let separatorRow = '|';

            for (let i = 1; i <= cols; i++) {
                const headerText = hasHeader ? `Nagłówek ${i}` : `Kolumna ${i}`;
                headerRow += ` ${headerText} |`;
                separatorRow += '-----------|';
            }

            table += headerRow + '\n' + separatorRow + '\n';

            // Generate data rows
            const startRow = hasHeader ? 1 : 0;
            const totalRows = hasHeader ? rows : rows + 1;

            for (let r = startRow; r < totalRows; r++) {
                let dataRow = '|';
                for (let c = 1; c <= cols; c++) {
                    const cellText = hasHeader ? `Dane ${r}-${c}` : `Wiersz ${r + 1} Kol ${c}`;
                    dataRow += ` ${cellText} |`;
                }
                table += dataRow + '\n';
            }

            return table;
        }

        function generateTableFromText(text, separator, hasHeader) {
            const lines = text.split('\n').filter(line => line.trim());
            if (lines.length === 0) return '';

            let detectedSeparator = separator;

            // Auto-detect separator if needed
            if (separator === 'auto') {
                const firstLine = lines[0];
                if (firstLine.includes('|')) detectedSeparator = '|';
                else if (firstLine.includes('\t')) detectedSeparator = '\t';
                else if (firstLine.includes(';')) detectedSeparator = ';';
                else if (firstLine.includes(',')) detectedSeparator = ',';
                else detectedSeparator = ' ';
            }

            // Convert separator escape sequences
            if (detectedSeparator === '\\t') detectedSeparator = '\t';

            let table = '';
            let maxColumns = 0;

            // Parse all lines to find max columns
            const parsedLines = lines.map(line => {
                let cells;
                if (detectedSeparator === ' ') {
                    // For space separator, split on multiple spaces
                    cells = line.trim().split(/\s+/);
                } else {
                    cells = line.split(detectedSeparator).map(cell => cell.trim());
                }
                maxColumns = Math.max(maxColumns, cells.length);
                return cells;
            });

            // Generate table
            parsedLines.forEach((cells, index) => {
                // Pad cells to match max columns
                while (cells.length < maxColumns) {
                    cells.push('');
                }

                // Create table row
                let row = '|';
                cells.forEach(cell => {
                    row += ` ${cell || ''} |`;
                });
                table += row + '\n';

                // Add separator row after header
                if (index === 0 && hasHeader) {
                    let separatorRow = '|';
                    for (let i = 0; i < maxColumns; i++) {
                        separatorRow += '-----------|';
                    }
                    table += separatorRow + '\n';
                }
            });

            return table;
        }

        function insertLink() {
            const linkText = prompt('Tekst linku:', 'Kliknij tutaj');
            const linkUrl = prompt('Adres URL:', 'https://example.com');
            if (linkText && linkUrl) {
                const linkTemplate = '[' + linkText + '](' + linkUrl + ')';
                if (!monacoEditor) return;
                const selection = monacoEditor.getSelection();
                monacoEditor.executeEdits('toolbar-action', [{
                    range: selection,
                    text: linkTemplate,
                    forceMoveMarkers: true
                }]);
                monacoEditor.focus();
                updateWordCounter();
            }
        }

        // === WORD COUNTER ===
        function updateWordCounter() {
            if (!monacoEditor) return;
            const text = monacoEditor.getValue();
            const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
            const chars = text.length;
            const charsNoSpaces = text.replace(/\s/g, '').length;
            const counter = document.getElementById('word-counter');
            if (counter) {
                counter.textContent = 'Słów: ' + words + ' | Znaków: ' + chars + ' (' + charsNoSpaces + ')';
            }
        }

        // === FORMAT LEGEND ===
        function createFormatLegend() {
            const container = document.getElementById('format-legend-container');
            if (!container) return;

            const legendSections = [
                {
                    id: 'headers',
                    icon: 'fa-solid fa-heading',
                    title: 'Nagłówki',
                    content: [
                        { code: '# Tytuł', desc: 'Duży nagłówek' },
                        { code: '## Podtytuł', desc: 'Mniejszy nagłówek' },
                        { code: '### Sekcja', desc: 'Mały nagłówek' }
                    ]
                },
                {
                    id: 'boxes',
                    icon: 'fa-solid fa-star',
                    title: 'Ramki',
                    content: [
                        { code: '[INFO] Treść', desc: 'Ramka informacyjna' },
                        { code: '[#1] Tytuł | Opis', desc: 'Ramka kroku 1' },
                        { code: '[#2] Tytuł | Opis', desc: 'Ramka kroku 2' }
                    ]
                },
                {
                    id: 'styling',
                    icon: 'fa-solid fa-font',
                    title: 'Style',
                    content: [
                        { code: '**Tekst**', desc: '<strong>Pogrubienie</strong>' },
                        { code: '*Tekst*', desc: '<em>Kursywa</em>' },
                        { code: '<u>Tekst</u>', desc: '<u>Podkreślenie</u>' },
                        { code: '~~Tekst~~', desc: '<s>Przekreślenie</s>' },
                        { code: '`kod`', desc: '<code>Kod inline</code>' }
                    ]
                },
                {
                    id: 'lists',
                    icon: 'fa-solid fa-list',
                    title: 'Listy',
                    content: [
                        { code: '- Punkt', desc: 'Lista punktowana' },
                        { code: '1. Punkt', desc: 'Lista numerowana' },
                        { code: '> Cytat', desc: 'Cytat/blok' }
                    ]
                },
                {
                    id: 'media',
                    icon: 'fa-solid fa-image',
                    title: 'Media',
                    content: [
                        { code: '![opis](url)', desc: 'Obraz z opisem' },
                        { code: '[link](url)', desc: 'Link do strony' },
                        { code: '---', desc: 'Linia pozioma' }
                    ]
                },
                {
                    id: 'tools',
                    icon: 'fa-solid fa-tools',
                    title: 'Narzędzia',
                    content: [
                        { text: '<i class="fa-solid fa-image" style="color: #7c3aed;"></i> - Dodaj obraz' },
                        { text: '<i class="fa-solid fa-icons" style="color: #fbbf24;"></i> - Ikony & emoji' },
                        { text: '<i class="fa-solid fa-magic-wand-sparkles" style="color: #ed993a;"></i> - Format tekst' }
                    ]
                }
            ];

            // Create tabs HTML
            let tabsHTML = '<div class="legend-tabs">';
            let contentHTML = '';

            legendSections.forEach((section, index) => {
                const isActive = index === 0 ? 'active' : '';

                // Tab button
                tabsHTML += `
                    <button class="legend-tab ${isActive}" data-tab="${section.id}">
                        <i class="${section.icon}"></i>
                        <span>${section.title}</span>
                    </button>
                `;

                // Tab content
                contentHTML += `
                    <div class="legend-tab-content ${isActive}" data-content="${section.id}">
                `;

                section.content.forEach(item => {
                    if (item.code) {
                        contentHTML += `
                            <p>
                                <code>${item.code}</code>
                                <span class="result">→ ${item.desc}</span>
                            </p>
                        `;
                    } else if (item.text) {
                        contentHTML += `<p>${item.text}</p>`;
                    }
                });

                contentHTML += '</div>';
            });

            tabsHTML += '</div>';

            // Complete legend HTML
            const legendHTML = `
                <div class="format-legend">
                    <div class="legend-header">
                        <strong>Jak formatować tekst?</strong>
                    </div>
                    <div class="legend-content">
                        ${tabsHTML}
                        ${contentHTML}
                    </div>
                </div>
            `;

            container.innerHTML = legendHTML;

            // Add event listeners for tab switching
            const tabButtons = container.querySelectorAll('.legend-tab');
            const tabContents = container.querySelectorAll('.legend-tab-content');

            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const targetTab = button.dataset.tab;

                    // Remove active class from all tabs and contents
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    tabContents.forEach(content => content.classList.remove('active'));

                    // Add active class to clicked tab and corresponding content
                    button.classList.add('active');
                    const targetContent = container.querySelector(`[data-content="${targetTab}"]`);
                    if (targetContent) {
                        targetContent.classList.add('active');
                    }
                });
            });
        }

        // === MODAL FUNCTIONS ===

        // Confirmation Modal
        const confirmModal = document.getElementById('confirmModal');
        function showConfirmModal() {
            confirmModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
        function hideConfirmModal() {
            confirmModal.classList.remove('show');
            document.body.style.overflow = '';
            pendingAction = null;
        }
        function confirmAction() {
            if (pendingAction) {
                pendingAction();
                pendingAction = null;
            }
            hideConfirmModal();
        }

        // PNG Export Modal
        const pngExportModal = document.getElementById('pngExportModal');
        function showPngExportModal() {
            pngExportModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
        function hidePngExportModal() {
            pngExportModal.classList.remove('show');
            document.body.style.overflow = '';
        }
        function handlePngExport(mode) {
            hidePngExportModal();

            // Debug info dla użytkownika
            if (mode === 'newtab') {
                console.log('🔄 Próbuję otworzyć PNG w nowej zakładce...');
                const button = document.getElementById('exportGraphicsPng');
                if (button) {
                    button.innerHTML = '🔄 Otwieranie...';
                }
            }

            actualPngExport(mode);
        }

        // Icons Modal
        const iconsModal = document.getElementById('iconsModal');
        function showIconsModal() {
            iconsModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
        function hideIconsModal() {
            iconsModal.classList.remove('show');
            document.body.style.overflow = '';
        }
        function insertIcon(icon) {
            if (!monacoEditor) return;
            const selection = monacoEditor.getSelection();
            const iconText = icon.includes('<') ? icon + ' ' : icon + ' ';
            monacoEditor.executeEdits('toolbar-action', [{
                range: selection,
                text: iconText,
                forceMoveMarkers: true
            }]);
            monacoEditor.focus();
            updateWordCounter();
            hideIconsModal();
        }

        // Image Modal
        const imageModal = document.getElementById('imageModal');
        const imageUrlInput = document.getElementById('imageUrl');
        const imageAltInput = document.getElementById('imageAlt');
        const imagePreview = document.getElementById('imagePreview');

        function showImageModal() {
            imageModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            setTimeout(() => { imageUrlInput.focus(); }, 100);
            clearImageForm();
        }
        function hideImageModal() {
            imageModal.classList.remove('show');
            document.body.style.overflow = '';
            clearImageForm();
        }
        function clearImageForm() {
            imageUrlInput.value = '';
            imageAltInput.value = '';
            resetImagePreview();
        }
        function resetImagePreview() {
            imagePreview.innerHTML = '<i class="fa-solid fa-image" style="font-size: 2rem; opacity: 0.5;"></i><p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">Podgląd pojawi się tutaj</p>';
        }
        function updateImagePreview() {
            const url = imageUrlInput.value.trim();
            const alt = imageAltInput.value.trim() || 'Podgląd obrazu';

            if (url && isValidImageUrl(url)) {
                const img = document.createElement('img');
                img.src = url;
                img.alt = alt;
                img.style.cssText = 'max-width: 100%; max-height: 150px; border-radius: 0px; display: block; margin: 0 auto;';
                img.onerror = () => {
                    imagePreview.innerHTML = '<i class="fa-solid fa-exclamation-triangle" style="color: #dc2626; font-size: 2rem;"></i><p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #dc2626;">Nie można załadować obrazu</p>';
                };
                img.onload = () => {
                    imagePreview.innerHTML = '';
                    imagePreview.appendChild(img);
                };
            } else if (url) {
                imagePreview.innerHTML = '<i class="fa-solid fa-exclamation-triangle" style="color: #f59e0b; font-size: 2rem;"></i><p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #f59e0b;">Nieprawidłowy URL obrazu</p>';
            } else {
                resetImagePreview();
            }
        }
        function isValidImageUrl(url) {
            try {
                const urlObj = new URL(url);
                return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
            } catch {
                return false;
            }
        }
        function insertImage() {
            if (!monacoEditor) return;
            const url = imageUrlInput.value.trim();
            const alt = imageAltInput.value.trim() || 'Obraz';
            if (!url) {
                imageUrlInput.style.borderColor = '#dc2626';
                imageUrlInput.focus();
                setTimeout(() => { imageUrlInput.style.borderColor = ''; }, 2000);
                return;
            }
            const imageMarkdown = '![' + alt + '](' + url + ')\n';
            const selection = monacoEditor.getSelection();
            monacoEditor.executeEdits('toolbar-action', [{
                range: selection,
                text: imageMarkdown,
                forceMoveMarkers: true
            }]);
            monacoEditor.focus();
            updateWordCounter();
            hideImageModal();
        }
        async function pasteImageFromClipboard() {
            try {
                const clipboardText = await navigator.clipboard.readText();
                imageUrlInput.value = clipboardText;
                updateImagePreview();
            } catch (err) {
                imageUrlInput.focus();
            }
        }

        // Format Modal
        const formatModal = document.getElementById('formatModal');
        function showFormatModal() {
            formatModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            setTimeout(() => { document.getElementById('formatTextArea').focus(); }, 100);
        }
        function hideFormatModal() {
            formatModal.classList.remove('show');
            document.body.style.overflow = '';
            document.getElementById('formatTextArea').value = '';
        }

        function formatText() {
            if (!monacoEditor) return;
            const textarea = document.getElementById('formatTextArea');
            const currentText = textarea.value;
            if (!currentText.trim()) {
                textarea.style.borderColor = '#dc2626';
                textarea.focus();
                setTimeout(() => { textarea.style.borderColor = ''; }, 2000);
                return;
            }

            const autoHeaders = document.getElementById('autoHeaders').checked;
            const autoBold = document.getElementById('autoBold').checked;
            const autoLists = document.getElementById('autoLists').checked;
            const autoSteps = document.getElementById('autoSteps').checked;
            const autoInfo = document.getElementById('autoInfo').checked;

            let formattedText = currentText.replace(/\r\n/g, '\n').replace(/\t/g, ' ').replace(/[ ]{2,}/g, ' ').trim();
            const lines = formattedText.split('\n');
            const processedLines = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                let processedLine = line;
                if (!line) { processedLines.push(''); continue; }

                if (autoHeaders && line.length > 3) {
                    const uppercaseCount = (line.match(/[A-ZĄĆĘŁŃÓŚŹŻ]/g) || []).length;
                    const letterCount = (line.match(/[A-ZĄĆĘŁŃÓŚŹŻa-ząćęłńóśźż]/g) || []).length;
                    if (!line.startsWith('#') && !line.startsWith('[') && letterCount > 2) {
                        if (/(?:INSTRUKCJA|PROCEDURA|REGULAMIN|ZASADY|INFORMACJA|PRZEWODNIK|PORADNIK|MANUAL|OSTRZEŻENIE|UWAGA)/i.test(line)) {
                            processedLine = '# ' + line;
                        } else if ((uppercaseCount / letterCount) > 0.5 && line.length < 50) {
                            processedLine = '## ' + line;
                        }
                    }
                }

                if (autoBold) {
                    processedLine = processedLine.replace(/(WAŻNE|UWAGA|OBOWIĄZKOWO|PAMIĘTAJ|OSTRZEŻENIE|BEZWZGLĘDNIE|ZAKAZ|NAKAZ|STOP|NIEBEZPIECZEŃSTWO|ALERT|PILNE)/gi, '**$1**');
                    processedLine = processedLine.replace(/(\d+(?:[.,]\d+)?(?:\s*%|\s*zł|\s*euro|\s*PLN|\s*szt\.?|\s*VAT))/gi, '**$1**');
                }

                if (autoLists) {
                    if (/^\s*\d+[\.\)]\s/.test(processedLine) && (!autoSteps || parseInt(processedLine.match(/^\s*(\d+)/)[1]) > 4)) {
                        processedLine = processedLine.replace(/^\s*\d+[\.\)]\s*/, '- ');
                    } else if (/^\s*[•\-\*►▪▫→]\s/.test(processedLine)) {
                        processedLine = processedLine.replace(/^\s*[•\-\*►▪▫→]\s*/, '- ');
                    }
                }

                if (autoSteps) {
                    const stepMatch = processedLine.match(/^\s*(\d+)[\.\)]\s*(.+)/) || processedLine.match(/^(?:-\s*)?(?:krok\s*)?(\d+)[\.\):\s]+(.+)/i);
                    if (stepMatch && parseInt(stepMatch[1]) <= 4) {
                        const stepNum = stepMatch[1];
                        let stepContent = stepMatch[2].trim();
                        if (stepContent.includes('|')) {
                            processedLine = '[#' + stepNum + '] ' + stepContent;
                        } else {
                            let title = '', description = '';
                            const separators = [' - ', ' – ', ' — ', ': ', ' → ', ' > '];
                            let found = false;
                            for (const sep of separators) {
                                if (stepContent.includes(sep)) {
                                    const parts = stepContent.split(sep);
                                    title = parts[0].trim();
                                    description = parts.slice(1).join(sep).trim();
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                const words = stepContent.split(' ');
                                if (words.length > 5) {
                                    title = words.slice(0, 4).join(' ');
                                    description = words.slice(4).join(' ');
                                } else {
                                    title = stepContent;
                                    description = 'Wykonaj zgodnie z instrukcją';
                                }
                            }
                            processedLine = '[#' + stepNum + '] ' + title + ' | ' + description;
                        }
                    }
                }

                if (autoInfo) {
                    if (/^\s*(UWAGA|INFORMACJA|WAŻNE|PAMIĘTAJ|WSKAZÓWKA|RADA|TIP|HINT|INFO|NOTA|OSTRZEŻENIE)[:\.!\s]/i.test(processedLine)) {
                        processedLine = processedLine.replace(/^\s*(UWAGA|INFORMACJA|WAŻNE|PAMIĘTAJ|WSKAZÓWKA|RADA|TIP|HINT|INFO|NOTA|OSTRZEŻENIE)[:\.!\s]*/i, '[INFO] ');
                    } else if (/^\s*(?:\*{1,3}|!{1,3})\s*((?:uwaga|ważne|informacja|ostrzeżenie).+)/i.test(processedLine)) {
                        processedLine = processedLine.replace(/^\s*(?:\*{1,3}|!{1,3})\s*/i, '[INFO] ');
                    }
                }

                processedLines.push(processedLine);
            }

            const finalText = processedLines.join('\n');
            monacoEditor.setValue(finalText);
            updatePreview();
            hideFormatModal();
        }

        function clearFormatTextArea() {
            const textarea = document.getElementById('formatTextArea');
            textarea.value = '';
            textarea.focus();
        }

        function loadTestText() {
            const testText = 'INSTRUKCJA OBSŁUGI URZĄDZENIA\nBezpieczeństwo użytkownika\n\n1. Sprawdzenie połączeń - sprawdź wszystkie kable\n2. Włączenie zasilania - naciśnij przycisk POWER\n3. Kalibracja systemu - postępuj zgodnie z menu\n4. Test działania - uruchom tryb testowy\n\nUWAGA: Przed użyciem przeczytaj instrukcję!\n(Ważne) Używaj tylko oryginalnych części\n OSTRZEŻENIE  Nie dotykaj elementów pod napięciem\n\nPamiętaj: zawsze wyłączaj urządzenie po użyciu\nKoszt serwisu: 150 zł + 23% VAT';
            const textarea = document.getElementById('formatTextArea');
            textarea.value = testText;
            textarea.focus();
        }

        async function pasteFromClipboard() {
            const textarea = document.getElementById('formatTextArea');
            try {
                const clipboardText = await navigator.clipboard.readText();
                textarea.value = clipboardText;
                textarea.focus();
            } catch (err) {
                textarea.focus();
            }
        }

        // Live preview update for image modal
        if (imageUrlInput) imageUrlInput.addEventListener('input', updateImagePreview);
        if (imageAltInput) imageAltInput.addEventListener('input', updateImagePreview);

        // Global event handlers
        window.hideConfirmModal = hideConfirmModal;
        window.confirmAction = confirmAction;
        window.showIconsModal = showIconsModal;
        window.hideIconsModal = hideIconsModal;
        window.insertIcon = insertIcon;
        window.showImageModal = showImageModal;
        window.hideImageModal = hideImageModal;
        window.insertImage = insertImage;
        window.clearImageForm = clearImageForm;
        window.pasteImageFromClipboard = pasteImageFromClipboard;
        window.showFormatModal = showFormatModal;
        window.hideFormatModal = hideFormatModal;
        window.formatText = formatText;
        window.clearFormatTextArea = clearFormatTextArea;
        window.loadTestText = loadTestText;
        window.pasteFromClipboard = pasteFromClipboard;
        window.exportGraphicsAsPng = exportGraphicsAsPng;
        window.hidePngExportModal = hidePngExportModal;
        window.handlePngExport = handlePngExport;
        window.hideTableModal = hideTableModal;
        window.switchTableTab = switchTableTab;
        window.generateTable = generateTable;

        // Modal closing by clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                if (e.target === confirmModal) hideConfirmModal();
                else if (e.target === iconsModal) hideIconsModal();
                else if (e.target === imageModal) hideImageModal();
                else if (e.target === formatModal) hideFormatModal();
                else if (e.target === pngExportModal) hidePngExportModal();
                else if (e.target === tableModal) hideTableModal();
            }
            // Icon button clicks
            if (e.target.classList.contains('icon-btn')) {
                const icon = e.target.dataset.icon;
                if (icon) insertIcon(icon);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (confirmModal.classList.contains('show')) hideConfirmModal();
                else if (formatModal.classList.contains('show')) hideFormatModal();
                else if (tableModal.classList.contains('show')) hideTableModal();
                else if (iconsModal.classList.contains('show')) hideIconsModal();
                else if (imageModal.classList.contains('show')) hideImageModal();
            }
        });

        // === SUCCESS MESSAGE ===
        console.log(`
🎉 GENERATOR GRAFIK ZAŁADOWANY POMYŚLNIE! 🎉

📝 Zaawansowane funkcje:
   • Monaco Editor z syntax highlighting
   • Rich Toolbar z 25+ przyciskami formatowania
   • Smart Modals (ikony, obrazy, formatowanie)
   • Live Preview z kolorowymi elementami
   • Word Counter w prawym dolnym rogu
   • PNG Export z wysoką rozdzielczością

🚀 Gotowy do tworzenia profesjonalnych grafik!
        `);


        // Add these to your existing script section
        document.addEventListener('DOMContentLoaded', function () {
            // Remove draggable attribute from all elements
            document.querySelectorAll('[draggable="true"]').forEach(el => {
                el.removeAttribute('draggable');
            });

            // Prevent dragstart event
            document.addEventListener('dragstart', function (e) {
                e.preventDefault();
                return false;
            });

            // Prevent drop event
            document.addEventListener('drop', function (e) {
                e.preventDefault();
                return false;
            });

            // Prevent dragover event
            document.addEventListener('dragover', function (e) {
                e.preventDefault();
                return false;
            });
        });
