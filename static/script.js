document.addEventListener('DOMContentLoaded', function() {
    const dropArea = document.getElementById('drop-area');
    const fileUpload = document.getElementById('file-upload');
    const fileName = document.getElementById('file-name');
    const fileInfo = document.getElementById('file-info');
    const analyzeBtn = document.getElementById('analyze-btn');
    const uploadForm = document.getElementById('upload-form');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const resultsSection = document.getElementById('results-section');
    const resultsBody = document.getElementById('results-body');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // Stats elements - Updated to include unknown count
    const totalEntries = document.getElementById('total-entries');
    const positiveCount = document.getElementById('positive-count');
    const neutralCount = document.getElementById('neutral-count');
    const negativeCount = document.getElementById('negative-count');
    const unknownCount = document.getElementById('unknown-count');
    
    // Store results data globally for word cloud filtering
    let analysisResults = [];

    // Check if Chart.js is loaded
    function checkChartJS() {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded! Please make sure Chart.js is included in your HTML.');
            return false;
        }
        console.log('Chart.js version:', Chart.version);
        return true;
    }

    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('active');
    }

    function unhighlight() {
        dropArea.classList.remove('active');
    }

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        
        if (file && file.name.toLowerCase().endsWith('.csv')) {
            handleFiles(file);
        } else {
            alert('Please select a valid CSV file');
        }
    }

    fileUpload.addEventListener('change', function() {
        if (this.files.length > 0) {
            const file = this.files[0];
            if (file.name.toLowerCase().endsWith('.csv')) {
                handleFiles(file);
            } else {
                alert('Please select a valid CSV file');
                this.value = '';
            }
        }
    });

    function handleFiles(file) {
        fileInfo.style.display = 'flex';
        fileName.textContent = file.name;
        analyzeBtn.disabled = false;
    }

    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!fileUpload.files.length) {
            alert('Please select a file first');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileUpload.files[0]);

        // Show loading indicator
        loadingOverlay.style.display = 'flex';
        progressContainer.style.display = 'block';
        
        // Simulate progress for better UX
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            if (progress > 90) {
                clearInterval(progressInterval);
            }
            progressBar.style.width = `${progress}%`;
        }, 300);

        fetch('/analyze_dataset', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error(error.error || 'Unknown error occurred');
                });
            }
            return response.json();
        })
        .then(data => {
            // Clear any previous simulation
            clearInterval(progressInterval);
            progressBar.style.width = '100%';
            
            // Store results for later use
            analysisResults = data.results;
            
            // Show results after a brief delay
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
                progressContainer.style.display = 'none';
                displayResults(data.results);
            }, 500);
        })
        .catch(error => {
            clearInterval(progressInterval);
            loadingOverlay.style.display = 'none';
            progressContainer.style.display = 'none';
            alert(`Error: ${error.message}`);
        });
    });
    
    // Tab functionality for word cloud
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Generate word cloud based on language
            const language = this.getAttribute('data-language');
            generateWordCloud(language);
        });
    });

    function displayResults(results) {
        // Show results section
        resultsSection.style.display = 'block';
        
        // Clear previous results
        resultsBody.innerHTML = '';
        
        // Count sentiments - Updated to include unknown
        let positive = 0;
        let negative = 0;
        let neutral = 0;
        let unknown = 0;
                        
        // Language counts
        const languageCounts = {};
        
        // Add results to table
        results.forEach((result, index) => {
            // Update counters - Updated logic
            const sentiment = result.Sentiment.toLowerCase();
            if (sentiment === 'positive') {
                positive++;
            } else if (sentiment === 'negative') {
                negative++;
            } else if (sentiment === 'neutral') {
                neutral++;
            } else {
                // Handle unknown or any other sentiment
                unknown++;
            }
            
            // Count languages
            if (result.Language in languageCounts) {
                languageCounts[result.Language]++;
            } else {
                languageCounts[result.Language] = 1;
            }
            
            // Create row
            const row = document.createElement('tr');
            
            // Create sentiment badge class - Updated to include unknown
            let sentimentClass = 'sentiment-neutral';
            if (sentiment === 'positive') {
                sentimentClass = 'sentiment-positive';
            } else if (sentiment === 'negative') {
                sentimentClass = 'sentiment-negative';
            } else if (sentiment === 'neutral') {
                sentimentClass = 'sentiment-neutral';
            } else {
                sentimentClass = 'sentiment-unknown';
            }
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${result.Title}</td>
                <td><span class="sentiment-badge ${sentimentClass}">${result.Sentiment}</span></td>
                <td><span class="language-badge">${result.Language}</span></td>
            `;
            
            resultsBody.appendChild(row);
        });
        
        // Update stats - Updated to include unknown
        totalEntries.textContent = results.length;
        positiveCount.textContent = positive;
        neutralCount.textContent = neutral;
        negativeCount.textContent = negative;
        if (unknownCount) unknownCount.textContent = unknown;
        
        // Debug chart creation
        console.log('Sentiment counts:', { positive, neutral, negative, unknown });
        
        // Create sentiment distribution chart with better error handling
        setTimeout(() => {
            createSentimentChart(positive, neutral, negative, unknown);
        }, 100);
        
        // Generate word cloud for all words initially
        generateWordCloud('all');
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    function createSentimentChart(positive, neutral, negative, unknown) {
        console.log('Attempting to create sentiment chart...');
        
        // Check if Chart.js is available
        if (!checkChartJS()) {
            console.error('Cannot create chart: Chart.js not available');
            return;
        }
        
        // Get canvas element
        const canvas = document.getElementById('sentimentChart');
        if (!canvas) {
            console.error('Canvas element with id "sentimentChart" not found');
            return;
        }
        
        console.log('Canvas element found:', canvas);
        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
        
        // Make sure canvas is visible and has dimensions
        canvas.style.display = 'block';
        
        // Fix blurry canvas on high-DPI displays
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = rect.width * dpr;
        canvas.height = 300 * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = '300px';
        
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        if (!ctx) {
            console.error('Could not get 2D context from canvas');
            return;
        }
        
        // Destroy existing chart if it exists
        if (window.sentimentChart && typeof window.sentimentChart.destroy === 'function') {
            console.log('Destroying existing chart');
            window.sentimentChart.destroy();
            window.sentimentChart = null;
        }
        
        // Prepare chart data with colors matching your CSS
        const chartData = {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{
                label: 'Number of Entries',
                data: [positive, neutral, negative],
                backgroundColor: [
                    'rgba(56, 176, 0, 0.7)',     // Matches .sentiment-positive background
                    'rgba(173, 181, 189, 0.7)',  // Matches .sentiment-neutral background  
                    'rgba(239, 71, 111, 0.7)'    // Matches .sentiment-negative background
                ],
                borderColor: [
                    'rgba(56, 176, 0, 1)',    // Matches .positive and .sentiment-positive color
                    'rgba(173, 181, 189, 1)',    // Matches .neutral and .sentiment-neutral color
                    'rgba(239, 71, 111, 1)'     // Matches .negative and .sentiment-negative color
                ],
                borderWidth: 2
            }]
        };
        
        // Add unknown to chart if it exists
        if (unknown > 0) {
            chartData.labels.push('Unknown');
            chartData.datasets[0].data.push(unknown);
            chartData.datasets[0].backgroundColor.push('rgba(144, 157, 174, 0.7)'); // Matches .sentiment-unknown background
            chartData.datasets[0].borderColor.push('rgba(144, 157, 174, 1)'); // Matches .sentiment-unknown color
        }
        
        console.log('Chart data:', chartData);
        
        try {
            // Create the chart with high-DPI support
            window.sentimentChart = new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    devicePixelRatio: window.devicePixelRatio || 1, // Fix for high-DPI displays
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Sentiment Distribution',
                            font: {
                                size: 16
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0,
                                callback: function(value) {
                                    return Number.isInteger(value) ? value : '';
                                }
                            }
                        }
                    },
                    animation: {
                        duration: 1000
                    }
                }
            });
            
            console.log('Chart created successfully:', window.sentimentChart);
            
        } catch (error) {
            console.error('Error creating chart:', error);
            
            // Fallback: show error message in chart container
            const chartContainer = canvas.parentElement;
            if (chartContainer) {
                chartContainer.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #666;">
                        <p>Unable to display chart</p>
                        <p><small>Error: ${error.message}</small></p>
                        <div style="margin-top: 10px; font-size: 14px;">
                            <div>Positive: ${positive}</div>
                            <div>Neutral: ${neutral}</div>
                            <div>Negative: ${negative}</div>
                            ${unknown > 0 ? `<div>Unknown: ${unknown}</div>` : ''}
                        </div>
                    </div>
                `;
            }
        }
    }
    
    // Enhanced word cloud function using WordCloud2.js (much faster for large datasets)
    function generateWordCloud(languageFilter) {
        // Clear the previous word cloud
        const container = document.getElementById('wordCloudContainer');
        container.innerHTML = '';
                        
        // Filter results based on language if needed
        let filteredResults = analysisResults;
        if (languageFilter !== 'all') {
            filteredResults = analysisResults.filter(result => 
                result.Language && result.Language.toLowerCase().startsWith(languageFilter.toLowerCase())
            );
        }
        
        if (filteredResults.length === 0) {
            container.innerHTML = 
                `<p style="text-align: center; padding: 20px;">No ${languageFilter} language data available.</p>`;
            return;
        }
        
        // Enhanced stop words list
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 
            'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 
            'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 
            'these', 'those', 'said', 'says', 'into', 'from', 'they', 'them', 'their', 'there', 
            'where', 'when', 'what', 'who', 'which', 'how', 'why', 'then', 'than', 'more', 'most', 
            'some', 'any', 'all', 'each', 'every', 'other', 'such', 'only', 'own', 'out', 'up', 
            'down', 'over', 'under', 'again', 'further', 'here', 'also', 'just', 'now', 'very', 
            'too', 'so', 'because', 'while', 'during', 'before', 'after', 'above', 'below', 'between',
            'through', 'about', 'against', 'among', 'across', 'behind', 'beside', 'beyond', 'within',
            'without', 'upon', 'until', 'unless', 'since', 'though', 'although', 'however', 'therefore',
            'people', 'person', 'time', 'year', 'day', 'way', 'man', 'woman', 'child', 'world', 
            'life', 'hand', 'part', 'place', 'case', 'point', 'group', 'number', 'area', 'money',
            'story', 'fact', 'month', 'lot', 'right', 'study', 'book', 'eye', 'job', 'word', 'business',
            'issue', 'side', 'kind', 'head', 'house', 'service', 'friend', 'father', 'power', 'hour',
            'game', 'line', 'end', 'member', 'law', 'car', 'city', 'community', 'name', 'president',
            'team', 'minute', 'idea', 'kid', 'body', 'information', 'back', 'parent', 'face', 'others',
            'level', 'office', 'door', 'health', 'person', 'art', 'war', 'history', 'party', 'result',
            'change', 'morning', 'reason', 'research', 'girl', 'guy', 'moment', 'air', 'teacher', 'force',
            'education', 'foot', 'boy', 'age', 'policy', 'process', 'music', 'including', 'considered',
            'appear', 'actually', 'buy', 'probably', 'human', 'paid', 'fire', 'certain', 'hard', 'order',
            'use', 'fact', 'least', 'tell', 'try', 'ask', 'need', 'feel', 'become', 'leave', 'put', 
            'mean', 'keep', 'let', 'begin', 'seem', 'help', 'talk', 'turn', 'start', 'show', 'hear', 
            'play', 'run', 'move', 'like', 'live', 'believe', 'hold', 'bring', 'happen', 'write', 
            'provide', 'sit', 'stand', 'lose', 'pay', 'meet', 'create', 'speak', 'read', 'allow', 
            'add', 'spend', 'grow', 'open', 'walk', 'win', 'offer', 'remember', 'love', 'consider', 
            'buy', 'wait', 'serve', 'die', 'send', 'expect', 'build', 'stay', 'fall', 'cut', 'reach'
        ]);
        
        // Create a text corpus from both Title and Content fields
        const text = filteredResults.map(result => {
            const title = result.Title || '';
            const content = result.Content || '';
            // Give more weight to titles by including them multiple times
            return `${title} ${title} ${title} ${content}`;
        }).join(' ');
        
        // Enhanced word processing for large datasets
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\d+/g, ' ')
            .replace(/\s+/g, ' ')
            .split(' ')
            .filter(word => 
                word.length >= 3 &&
                word.length <= 25 &&
                !stopWords.has(word) &&
                /^[a-zA-Z]+$/.test(word)
            );
        
        // Count word frequencies
        const wordFreq = {};
        words.forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });
        
        // Convert to array format for WordCloud2.js
        const wordData = Object.keys(wordFreq)
            .filter(word => wordFreq[word] >= 2)
            .map(word => [word, wordFreq[word]])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 100); // Top 100 words for better performance
        
        console.log('Word cloud data (top 10):', wordData.slice(0, 10));
        
        if (wordData.length === 0) {
            container.innerHTML = 
                '<p style="text-align: center; padding: 20px;">No meaningful words found for word cloud.</p>';
            return;
        }
        
        // Create canvas element for WordCloud2.js with high-DPI support
        const canvas = document.createElement('canvas');
        const containerWidth = container.offsetWidth || 600;
        const containerHeight = 400;
        const dpr = window.devicePixelRatio || 1;
        
        // Set actual canvas size for high-DPI displays
        canvas.width = containerWidth * dpr;
        canvas.height = containerHeight * dpr;
        
        // Set display size and center the canvas
        canvas.style.width = containerWidth + 'px';
        canvas.style.height = containerHeight + 'px';
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        
        // Scale the context for high-DPI
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        container.appendChild(canvas);
        
        // Color scheme matching SDG 13 Environmental/Climate Action theme (high contrast for readability)
        const colors = [
            '#1B5E20', // Deep forest green
            '#2E7D32', // Dark green
            '#388E3C', // Medium green
            '#43A047', // Bright green
            '#2D5016', // Dark forest green
            '#3E7B27', // Forest green  
            '#4A9B3B', // Leaf green
            '#0D47A1', // Deep blue
            '#1565C0', // Dark blue
            '#1976D2', // Medium blue
            '#0277BD', // Ocean blue
            '#0288D1', // Sky blue
            '#2F4F2F', // Dark olive green
            '#228B22', // Forest green
            '#006400', // Dark green
            '#4682B4'  // Steel blue
        ];
        
        // Check if WordCloud2 is available
        if (typeof WordCloud !== 'undefined') {
            // WordCloud2.js implementation (much faster) with centered layout
            WordCloud(canvas, {
                list: wordData,
                gridSize: Math.round(8 * containerWidth / 600), // Smaller grid for better centering
                weightFactor: function (size) {
                    return Math.pow(size, 0.8) * containerWidth / 800; // Adjusted weight factor
                },
                fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                color: function () {
                    return colors[Math.floor(Math.random() * colors.length)];
                },
                rotateRatio: 0.3,
                rotationSteps: 2,
                backgroundColor: '#f8f9fa', // Light environmental background
                minFontSize: 12,
                maxFontSize: 60, // Add max font size for better control
                fontWeight: '600',
                drawOutOfBound: false, // Prevent words from going outside canvas
                shrinkToFit: true, // Shrink words to fit in canvas
                origin: [containerWidth/2, containerHeight/2], // Center the word cloud
                hover: function(item, dimension, event) {
                    if (item) {
                        canvas.style.cursor = 'pointer';
                    } else {
                        canvas.style.cursor = 'default';
                    }
                },
                click: function(item, dimension, event) {
                    if (item) {
                        console.log(`Clicked on "${item[0]}" (frequency: ${item[1]})`);
                    }
                }
            });
        } else {
            // Fallback to Canvas-based simple word cloud (no external library needed)
            createCanvasWordCloud(canvas, wordData, colors, containerWidth, containerHeight);
        }
    }
    
    // Fallback canvas-based word cloud (no external library needed)
    function createCanvasWordCloud(canvas, wordData, colors, containerWidth, containerHeight) {
        const ctx = canvas.getContext('2d');
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        
        // Clear canvas
        ctx.fillStyle = '#fafafa';
        ctx.fillRect(0, 0, containerWidth, containerHeight);
        
        // Set font
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Simple spiral layout algorithm
        wordData.slice(0, 50).forEach((word, index) => {
            const [text, frequency] = word;
            const fontSize = Math.max(12, Math.min(frequency * 4, 48));
        // Color scheme matching SDG 13 Environmental/Climate Action theme
        const colors = [
            '#2D5016', // Dark forest green
            '#3E7B27', // Forest green  
            '#4A9B3B', // Leaf green
            '#66BB6A', // Light green
            '#1B5E20', // Deep green
            '#2E7D32', // Medium green
            '#388E3C', // Bright green
            '#43A047', // Grass green
            '#0277BD', // Ocean blue
            '#0288D1', // Sky blue
            '#039BE5', // Light blue
            '#4FC3F7', // Bright blue
            '#81C784', // Sage green
            '#A5D6A7', // Mint green
            '#C8E6C9', // Very light green
            '#E8F5E8'  // Pale green
        ];
            
            ctx.font = `600 ${fontSize}px Segoe UI, Tahoma, Geneva, Verdana, sans-serif`;
            ctx.fillStyle = color;
            
            // Simple positioning (can be improved with collision detection)
            const angle = (index * 137.508) * (Math.PI / 180); // Golden angle
            const radius = Math.sqrt(index + 1) * 8;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Ensure text stays within canvas bounds
            const textWidth = ctx.measureText(text).width;
            const finalX = Math.max(textWidth/2, Math.min(containerWidth - textWidth/2, x));
            const finalY = Math.max(fontSize/2, Math.min(containerHeight - fontSize/2, y));
            
            ctx.fillText(text, finalX, finalY);
        });
    }
    
    // Initialize on page load
    console.log('Sentiment analysis script loaded');
    checkChartJS();
});