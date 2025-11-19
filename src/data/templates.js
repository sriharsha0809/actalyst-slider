// Pre-designed presentation templates
// Each template contains multiple slides with elements

export const PRESENTATION_TEMPLATES = [
  {
    id: 'business-pitch',
    name: 'Business Pitch',
    description: 'Complete business pitch deck with charts, tables, and visuals (10+ slides)',
    thumbnail: { 
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      layout: 'title-content'
    },
    slides: [
      {
        name: 'Title Slide',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 150,
            w: 640,
            h: 100,
            text: 'Your Company Name',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 56,
              color: '#ffffff',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'text',
            x: 80,
            y: 280,
            w: 640,
            h: 60,
            text: 'Business Pitch Presentation',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 32,
              color: '#e0e0e0',
              bold: false,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          }
        ]
      },
      {
        name: 'Problem Statement',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 60,
            w: 640,
            h: 60,
            text: 'The Problem',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 44,
              color: '#667eea',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'text',
            x: 80,
            y: 140,
            w: 640,
            h: 240,
            text: '• Market gap or customer pain point\n• Current limitations\n• Why this matters now',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 28,
              color: '#333333',
              bold: false,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'bullet'
            }
          }
        ]
      },
      {
        name: 'Solution',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 60,
            w: 640,
            h: 60,
            text: 'Our Solution',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 44,
              color: '#764ba2',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'text',
            x: 80,
            y: 140,
            w: 640,
            h: 240,
            text: '• Our innovative approach\n• Key features and benefits\n• How we solve the problem',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 28,
              color: '#333333',
              bold: false,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'bullet'
            }
          }
        ]
      },
      {
        name: 'Market Data',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Market Growth',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#667eea',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'chart',
            chartType: 'bar',
            chartStyle: '2d',
            x: 80,
            y: 110,
            w: 640,
            h: 300,
            structuredData: {
              categories: ['Q1', 'Q2', 'Q3', 'Q4'],
              series: [{ name: 'Revenue', data: [120, 180, 240, 320] }]
            },
            legendOptions: {
              show: true,
              showXAxis: true,
              showYAxis: true
            }
          }
        ]
      },
      {
        name: 'Revenue Trends',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Revenue Growth Over Time',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#764ba2',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'chart',
            chartType: 'line',
            chartStyle: 'smooth',
            x: 80,
            y: 110,
            w: 640,
            h: 300,
            structuredData: {
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              series: [{ name: 'Revenue ($K)', data: [50, 75, 100, 140, 190, 250] }]
            },
            legendOptions: {
              show: true,
              showXAxis: true,
              showYAxis: true
            }
          }
        ]
      },
      {
        name: 'Market Share',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Market Share Distribution',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#667eea',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'chart',
            chartType: 'pie',
            chartStyle: '2d',
            x: 180,
            y: 110,
            w: 440,
            h: 300,
            structuredData: {
              categories: ['Our Company', 'Competitor A', 'Competitor B', 'Others'],
              series: [{ name: 'Market Share', data: [35, 28, 22, 15] }]
            },
            legendOptions: {
              show: true
            }
          }
        ]
      },
      {
        name: 'Product Comparison',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Product Feature Comparison',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#764ba2',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'table',
            x: 80,
            y: 110,
            w: 640,
            h: 280,
            rows: 5,
            cols: 4,
            headerRow: true,
            headerBg: '#667eea',
            headerTextColor: '#ffffff',
            cellBg: '#ffffff',
            borderColor: '#e5e7eb',
            cells: [
              { text: 'Feature', styles: { bold: true, align: 'left', fontSize: 16 } },
              { text: 'Basic', styles: { bold: true, align: 'center', fontSize: 16 } },
              { text: 'Pro', styles: { bold: true, align: 'center', fontSize: 16 } },
              { text: 'Enterprise', styles: { bold: true, align: 'center', fontSize: 16 } },
              { text: 'Users', styles: { align: 'left', fontSize: 14 } },
              { text: '5', styles: { align: 'center', fontSize: 14 } },
              { text: '25', styles: { align: 'center', fontSize: 14 } },
              { text: 'Unlimited', styles: { align: 'center', fontSize: 14 } },
              { text: 'Storage', styles: { align: 'left', fontSize: 14 } },
              { text: '10GB', styles: { align: 'center', fontSize: 14 } },
              { text: '100GB', styles: { align: 'center', fontSize: 14 } },
              { text: '1TB', styles: { align: 'center', fontSize: 14 } },
              { text: 'Support', styles: { align: 'left', fontSize: 14 } },
              { text: 'Email', styles: { align: 'center', fontSize: 14 } },
              { text: 'Priority', styles: { align: 'center', fontSize: 14 } },
              { text: '24/7', styles: { align: 'center', fontSize: 14 } },
              { text: 'Price/mo', styles: { align: 'left', fontSize: 14 } },
              { text: '$29', styles: { align: 'center', fontSize: 14 } },
              { text: '$99', styles: { align: 'center', fontSize: 14 } },
              { text: '$299', styles: { align: 'center', fontSize: 14 } }
            ]
          }
        ]
      },
      {
        name: 'Team Structure',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Our Team',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#667eea',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'circle',
            x: 120,
            y: 120,
            w: 140,
            h: 140,
            fill: '#667eea',
            stroke: '#764ba2',
            opacity: 0.8
          },
          {
            type: 'text',
            x: 120,
            y: 275,
            w: 140,
            h: 80,
            text: 'CEO\nJohn Doe\n15 years exp',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 14,
              color: '#333333',
              bold: false,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'circle',
            x: 340,
            y: 120,
            w: 140,
            h: 140,
            fill: '#764ba2',
            stroke: '#667eea',
            opacity: 0.8
          },
          {
            type: 'text',
            x: 340,
            y: 275,
            w: 140,
            h: 80,
            text: 'CTO\nJane Smith\n12 years exp',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 14,
              color: '#333333',
              bold: false,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'circle',
            x: 560,
            y: 120,
            w: 140,
            h: 140,
            fill: '#9F7AEA',
            stroke: '#667eea',
            opacity: 0.8
          },
          {
            type: 'text',
            x: 560,
            y: 275,
            w: 140,
            h: 80,
            text: 'CFO\nBob Wilson\n10 years exp',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 14,
              color: '#333333',
              bold: false,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          }
        ]
      },
      {
        name: 'Milestones',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Project Timeline & Milestones',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#764ba2',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'rect',
            x: 80,
            y: 120,
            w: 120,
            h: 80,
            fill: '#667eea',
            stroke: '#764ba2',
            opacity: 0.9
          },
          {
            type: 'text',
            x: 80,
            y: 130,
            w: 120,
            h: 60,
            text: 'Q1\nResearch',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              color: '#ffffff',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'rect',
            x: 220,
            y: 120,
            w: 120,
            h: 80,
            fill: '#764ba2',
            stroke: '#667eea',
            opacity: 0.9
          },
          {
            type: 'text',
            x: 220,
            y: 130,
            w: 120,
            h: 60,
            text: 'Q2\nDevelopment',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              color: '#ffffff',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'rect',
            x: 360,
            y: 120,
            w: 120,
            h: 80,
            fill: '#9F7AEA',
            stroke: '#667eea',
            opacity: 0.9
          },
          {
            type: 'text',
            x: 360,
            y: 130,
            w: 120,
            h: 60,
            text: 'Q3\nTesting',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              color: '#ffffff',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'rect',
            x: 500,
            y: 120,
            w: 120,
            h: 80,
            fill: '#667eea',
            stroke: '#764ba2',
            opacity: 0.9
          },
          {
            type: 'text',
            x: 500,
            y: 130,
            w: 120,
            h: 60,
            text: 'Q4\nLaunch',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              color: '#ffffff',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'text',
            x: 80,
            y: 230,
            w: 640,
            h: 120,
            text: 'Key Deliverables:\n• Product MVP by Q2\n• Beta testing with 100 users in Q3\n• Full launch with marketing campaign in Q4',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 18,
              color: '#333333',
              bold: false,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'bullet'
            }
          }
        ]
      },
      {
        name: 'Customer Feedback',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Customer Satisfaction',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#667eea',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'image',
            x: 80,
            y: 110,
            w: 280,
            h: 200,
            imageUrl: 'https://via.placeholder.com/280x200/667eea/ffffff?text=Customer+Photo',
            objectFit: 'cover'
          },
          {
            type: 'text',
            x: 380,
            y: 110,
            w: 340,
            h: 200,
            text: '"This product transformed our workflow. We\'ve seen a 300% increase in productivity!"\n\n- Sarah Johnson\nCEO, Tech Startup Inc.',
            bgColor: '#f3f4f6',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 18,
              color: '#333333',
              bold: false,
              italic: true,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'text',
            x: 80,
            y: 330,
            w: 640,
            h: 60,
            text: '⭐⭐⭐⭐⭐  4.9/5 Average Rating (Based on 500+ reviews)',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 20,
              color: '#764ba2',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          }
        ]
      },
      {
        name: 'Competitive Analysis',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Competitive Landscape',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#764ba2',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'table',
            x: 80,
            y: 110,
            w: 640,
            h: 280,
            rows: 5,
            cols: 5,
            headerRow: true,
            headerBg: '#764ba2',
            headerTextColor: '#ffffff',
            cellBg: '#ffffff',
            borderColor: '#e5e7eb',
            cells: [
              { text: 'Company', styles: { bold: true, align: 'left', fontSize: 14 } },
              { text: 'Market Share', styles: { bold: true, align: 'center', fontSize: 14 } },
              { text: 'Price', styles: { bold: true, align: 'center', fontSize: 14 } },
              { text: 'Rating', styles: { bold: true, align: 'center', fontSize: 14 } },
              { text: 'Growth', styles: { bold: true, align: 'center', fontSize: 14 } },
              { text: 'Us', styles: { bold: true, align: 'left', fontSize: 13 } },
              { text: '35%', styles: { align: 'center', fontSize: 13, bgColor: '#d4edda' } },
              { text: '$$', styles: { align: 'center', fontSize: 13 } },
              { text: '4.9', styles: { align: 'center', fontSize: 13 } },
              { text: '+45%', styles: { align: 'center', fontSize: 13, bgColor: '#d4edda' } },
              { text: 'Competitor A', styles: { align: 'left', fontSize: 13 } },
              { text: '28%', styles: { align: 'center', fontSize: 13 } },
              { text: '$$$', styles: { align: 'center', fontSize: 13 } },
              { text: '4.2', styles: { align: 'center', fontSize: 13 } },
              { text: '+12%', styles: { align: 'center', fontSize: 13 } },
              { text: 'Competitor B', styles: { align: 'left', fontSize: 13 } },
              { text: '22%', styles: { align: 'center', fontSize: 13 } },
              { text: '$', styles: { align: 'center', fontSize: 13 } },
              { text: '3.8', styles: { align: 'center', fontSize: 13 } },
              { text: '+8%', styles: { align: 'center', fontSize: 13 } },
              { text: 'Others', styles: { align: 'left', fontSize: 13 } },
              { text: '15%', styles: { align: 'center', fontSize: 13 } },
              { text: '$$', styles: { align: 'center', fontSize: 13 } },
              { text: '3.5', styles: { align: 'center', fontSize: 13 } },
              { text: '+5%', styles: { align: 'center', fontSize: 13 } }
            ]
          }
        ]
      },
      {
        name: 'Investment Ask',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 60,
            w: 640,
            h: 50,
            text: 'Investment Opportunity',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 42,
              color: '#667eea',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'rect',
            x: 180,
            y: 140,
            w: 440,
            h: 120,
            fill: '#667eea',
            stroke: '#764ba2',
            opacity: 0.15
          },
          {
            type: 'text',
            x: 180,
            y: 160,
            w: 440,
            h: 80,
            text: 'Seeking $2M Series A\nto scale operations and expand market reach',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 26,
              color: '#333333',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'text',
            x: 80,
            y: 290,
            w: 640,
            h: 100,
            text: 'Use of Funds:\n• Product Development: 40%\n• Marketing & Sales: 35%\n• Team Expansion: 25%',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 20,
              color: '#333333',
              bold: false,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'bullet'
            }
          }
        ]
      },
      {
        name: 'Thank You',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 140,
            w: 640,
            h: 100,
            text: 'Thank You',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 60,
              color: '#ffffff',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'text',
            x: 80,
            y: 260,
            w: 640,
            h: 100,
            text: 'Questions?\ncontact@company.com\n+1 (555) 123-4567',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 22,
              color: '#e0e0e0',
              bold: false,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'marketing-report',
    name: 'Marketing Report',
    description: 'Clean marketing presentation with metrics and insights',
    thumbnail: {
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      layout: 'split'
    },
    slides: [
      {
        name: 'Cover',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 180,
            w: 640,
            h: 120,
            text: 'Marketing Report\nQ4 2024',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 52,
              color: '#ffffff',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          }
        ]
      },
      {
        name: 'Key Metrics',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Performance Overview',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#f5576c',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'chart',
            chartType: 'line',
            chartStyle: 'smooth',
            x: 80,
            y: 110,
            w: 640,
            h: 300,
            structuredData: {
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              series: [
                { name: 'Traffic', data: [4000, 5200, 4800, 6400, 7200, 8100] },
                { name: 'Conversions', data: [2400, 3100, 2800, 3800, 4200, 4900] }
              ]
            },
            legendOptions: {
              show: true,
              showXAxis: true,
              showYAxis: true
            }
          }
        ]
      },
      {
        name: 'Channel Distribution',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Traffic Sources',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#f093fb',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'chart',
            chartType: 'pie',
            chartStyle: '2d',
            x: 180,
            y: 110,
            w: 440,
            h: 300,
            structuredData: {
              categories: ['Organic', 'Paid', 'Social', 'Direct', 'Referral'],
              series: [{ name: 'Traffic', data: [35, 25, 20, 15, 5] }]
            },
            legendOptions: {
              show: true
            }
          }
        ]
      }
    ]
  },
  {
    id: 'project-proposal',
    name: 'Project Proposal',
    description: 'Professional project proposal with timeline and budget',
    thumbnail: {
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      layout: 'list'
    },
    slides: [
      {
        name: 'Project Title',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 160,
            w: 640,
            h: 100,
            text: 'Project Proposal',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 56,
              color: '#ffffff',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'text',
            x: 80,
            y: 280,
            w: 640,
            h: 50,
            text: 'Presented by Your Team',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 24,
              color: '#e0e0e0',
              bold: false,
              italic: true,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          }
        ]
      },
      {
        name: 'Executive Summary',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 60,
            w: 640,
            h: 60,
            text: 'Executive Summary',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 44,
              color: '#4facfe',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'text',
            x: 80,
            y: 140,
            w: 640,
            h: 240,
            text: '• Project overview and objectives\n• Expected outcomes\n• Resource requirements\n• Timeline and milestones',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 26,
              color: '#333333',
              bold: false,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'bullet'
            }
          }
        ]
      },
      {
        name: 'Budget Breakdown',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Budget Allocation',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#00f2fe',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'chart',
            chartType: 'bar',
            chartStyle: 'horizontal',
            x: 80,
            y: 110,
            w: 640,
            h: 300,
            structuredData: {
              categories: ['Development', 'Marketing', 'Operations', 'Research'],
              series: [{ name: 'Budget ($K)', data: [150, 80, 60, 40] }]
            },
            legendOptions: {
              show: true,
              showXAxis: true,
              showYAxis: true
            }
          }
        ]
      }
    ]
  },
  {
    id: 'startup-deck',
    name: 'Startup Deck',
    description: 'Modern startup pitch deck with bold design',
    thumbnail: {
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      layout: 'hero'
    },
    slides: [
      {
        name: 'Opening',
        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 140,
            w: 640,
            h: 140,
            text: 'Building the\nFuture',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 64,
              color: '#ffffff',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          }
        ]
      },
      {
        name: 'Vision',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 80,
            w: 640,
            h: 280,
            text: 'Our Vision\n\nTo revolutionize how people interact with technology through innovative solutions.',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 32,
              color: '#333333',
              bold: false,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          }
        ]
      },
      {
        name: 'Traction',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Growth Metrics',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#fa709a',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'chart',
            chartType: 'line',
            chartStyle: 'gradient',
            x: 80,
            y: 110,
            w: 640,
            h: 300,
            structuredData: {
              categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
              series: [{ name: 'Users', data: [100, 350, 700, 1200] }]
            },
            chartColor: { color: '#fa709a', mode: 'gradient' },
            legendOptions: {
              show: true,
              showXAxis: true,
              showYAxis: true
            }
          }
        ]
      }
    ]
  },
  {
    id: 'educational',
    name: 'Educational',
    description: 'Clean educational presentation template',
    thumbnail: {
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      layout: 'title-content'
    },
    slides: [
      {
        name: 'Lesson Title',
        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 170,
            w: 640,
            h: 100,
            text: 'Today\'s Lesson',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 54,
              color: '#2c3e50',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          }
        ]
      },
      {
        name: 'Learning Objectives',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 60,
            w: 640,
            h: 60,
            text: 'Learning Objectives',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 42,
              color: '#16a085',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'text',
            x: 80,
            y: 140,
            w: 640,
            h: 240,
            text: '1. Understand the core concepts\n2. Apply knowledge to real situations\n3. Develop critical thinking skills\n4. Practice problem-solving',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 26,
              color: '#2c3e50',
              bold: false,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'number'
            }
          }
        ]
      },
      {
        name: 'Key Concepts',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 60,
            w: 640,
            h: 60,
            text: 'Key Concepts',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 42,
              color: '#e74c3c',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'text',
            x: 80,
            y: 140,
            w: 300,
            h: 240,
            text: 'Concept 1:\nExplanation and examples',
            bgColor: '#ecf0f1',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 20,
              color: '#2c3e50',
              bold: false,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'text',
            x: 420,
            y: 140,
            w: 300,
            h: 240,
            text: 'Concept 2:\nExplanation and examples',
            bgColor: '#ecf0f1',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 20,
              color: '#2c3e50',
              bold: false,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Sleek dark theme for modern presentations',
    thumbnail: {
      gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
      layout: 'minimal'
    },
    slides: [
      {
        name: 'Dark Title',
        background: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 180,
            w: 640,
            h: 140,
            text: 'Minimal\nPresentation',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 56,
              color: '#ffffff',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          }
        ]
      },
      {
        name: 'Content',
        background: '#1a1a1a',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 60,
            w: 640,
            h: 60,
            text: 'Simple & Clean',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 44,
              color: '#ffffff',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'text',
            x: 80,
            y: 140,
            w: 640,
            h: 240,
            text: 'Focus on what matters\n\nClean design with maximum impact',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 28,
              color: '#cccccc',
              bold: false,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          }
        ]
      },
      {
        name: 'Key Metrics',
        background: '#111111',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Performance Metrics',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#f5f5f5',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'chart',
            chartType: 'line',
            chartStyle: 'smooth',
            x: 80,
            y: 110,
            w: 640,
            h: 280,
            structuredData: {
              categories: ['Q1', 'Q2', 'Q3', 'Q4'],
              series: [
                { name: 'Revenue', data: [120, 150, 170, 210] },
                { name: 'Users', data: [80, 110, 140, 190] }
              ]
            },
            legendOptions: {
              show: true,
              showXAxis: true,
              showYAxis: true
            }
          }
        ]
      },
      {
        name: 'Highlights',
        background: '#141414',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 50,
            w: 640,
            h: 50,
            text: 'Feature Highlights',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 36,
              color: '#ffffff',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'rect',
            x: 80,
            y: 130,
            w: 180,
            h: 150,
            fill: '#1f2933',
            stroke: '#4b5563',
            opacity: 0.9
          },
          {
            type: 'text',
            x: 90,
            y: 150,
            w: 160,
            h: 110,
            text: 'Speed\nOptimized rendering\nfor any device',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 18,
              color: '#e5e7eb',
              bold: false,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'rect',
            x: 300,
            y: 130,
            w: 180,
            h: 150,
            fill: '#111827',
            stroke: '#6b7280',
            opacity: 0.9
          },
          {
            type: 'text',
            x: 310,
            y: 150,
            w: 160,
            h: 110,
            text: 'Security\nEnd-to-end encrypted\ndata flows',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 18,
              color: '#e5e7eb',
              bold: false,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'rect',
            x: 520,
            y: 130,
            w: 180,
            h: 150,
            fill: '#1f2933',
            stroke: '#4b5563',
            opacity: 0.9
          },
          {
            type: 'text',
            x: 530,
            y: 150,
            w: 160,
            h: 110,
            text: 'Support\n24/7 dedicated team\nwith SLA',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 18,
              color: '#e5e7eb',
              bold: false,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          }
        ]
      },
      {
        name: 'Roadmap',
        background: '#101010',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 50,
            w: 640,
            h: 50,
            text: 'Product Roadmap',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 36,
              color: '#ffffff',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'rect',
            x: 80,
            y: 140,
            w: 640,
            h: 10,
            fill: '#374151',
            stroke: '#6b7280',
            opacity: 0.8
          },
          {
            type: 'circle',
            x: 120,
            y: 120,
            w: 40,
            h: 40,
            fill: '#22d3ee',
            stroke: '#111827'
          },
          {
            type: 'text',
            x: 90,
            y: 180,
            w: 120,
            h: 80,
            text: 'Q1\nFoundation',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 18,
              color: '#e5e7eb',
              bold: false,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'circle',
            x: 300,
            y: 120,
            w: 40,
            h: 40,
            fill: '#22d3ee',
            stroke: '#111827'
          },
          {
            type: 'text',
            x: 270,
            y: 180,
            w: 120,
            h: 80,
            text: 'Q2\nAutomation',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 18,
              color: '#e5e7eb',
              bold: false,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'circle',
            x: 480,
            y: 120,
            w: 40,
            h: 40,
            fill: '#22d3ee',
            stroke: '#111827'
          },
          {
            type: 'text',
            x: 450,
            y: 180,
            w: 120,
            h: 80,
            text: 'Q3\nScale',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 18,
              color: '#e5e7eb',
              bold: false,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'circle',
            x: 660,
            y: 120,
            w: 40,
            h: 40,
            fill: '#22d3ee',
            stroke: '#111827'
          },
          {
            type: 'text',
            x: 630,
            y: 180,
            w: 120,
            h: 80,
            text: 'Q4\nGlobal Launch',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 18,
              color: '#e5e7eb',
              bold: false,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          }
        ]
      },
      {
        name: 'Hero Image',
        background: '#0d0d0d',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Immersive Visuals',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#f5f5f5',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'image',
            x: 80,
            y: 110,
            w: 640,
            h: 260,
            imageUrl: 'https://via.placeholder.com/640x260/111111/ffffff?text=Dark+Imagery',
            objectFit: 'cover'
          }
        ]
      },
      {
        name: 'Audience',
        background: '#111111',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Audience Breakdown',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 36,
              color: '#ffffff',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'chart',
            chartType: 'pie',
            chartStyle: '2d',
            x: 200,
            y: 120,
            w: 360,
            h: 280,
            structuredData: {
              categories: ['Enterprise', 'SMB', 'Startup', 'Freelance'],
              series: [
                { name: 'Segments', data: [40, 30, 20, 10] }
              ]
            },
            legendOptions: {
              show: true
            }
          }
        ]
      },
      {
        name: 'KPIs',
        background: '#141414',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Key KPIs',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 36,
              color: '#f5f5f5',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'table',
            x: 80,
            y: 110,
            w: 640,
            h: 260,
            rows: 5,
            cols: 4,
            headerRow: true,
            headerBg: '#1f2937',
            headerTextColor: '#f5f5f5',
            cellBg: '#0f172a',
            borderColor: '#374151',
            cells: [
              { text: 'Metric', styles: { bold: true, align: 'left', fontSize: 14, color: '#f5f5f5' } },
              { text: 'Target', styles: { bold: true, align: 'center', fontSize: 14, color: '#f5f5f5' } },
              { text: 'Current', styles: { bold: true, align: 'center', fontSize: 14, color: '#f5f5f5' } },
              { text: 'Trend', styles: { bold: true, align: 'center', fontSize: 14, color: '#f5f5f5' } },
              { text: 'MRR', styles: { align: 'left', fontSize: 13, color: '#e5e7eb' } },
              { text: '$500k', styles: { align: 'center', fontSize: 13, color: '#e5e7eb' } },
              { text: '$420k', styles: { align: 'center', fontSize: 13, color: '#22d3ee' } },
              { text: '▲', styles: { align: 'center', fontSize: 16, color: '#34d399' } },
              { text: 'Retention', styles: { align: 'left', fontSize: 13, color: '#e5e7eb' } },
              { text: '92%', styles: { align: 'center', fontSize: 13, color: '#e5e7eb' } },
              { text: '88%', styles: { align: 'center', fontSize: 13, color: '#facc15' } },
              { text: '▲', styles: { align: 'center', fontSize: 16, color: '#34d399' } },
              { text: 'NPS', styles: { align: 'left', fontSize: 13, color: '#e5e7eb' } },
              { text: '65', styles: { align: 'center', fontSize: 13, color: '#e5e7eb' } },
              { text: '58', styles: { align: 'center', fontSize: 13, color: '#f87171' } },
              { text: '▼', styles: { align: 'center', fontSize: 16, color: '#f87171' } },
              { text: 'Latency', styles: { align: 'left', fontSize: 13, color: '#e5e7eb' } },
              { text: '< 150ms', styles: { align: 'center', fontSize: 13, color: '#e5e7eb' } },
              { text: '132ms', styles: { align: 'center', fontSize: 13, color: '#22d3ee' } },
              { text: '▲', styles: { align: 'center', fontSize: 16, color: '#34d399' } }
            ]
          }
        ]
      },
      {
        name: 'Quote',
        background: '#0f0f0f',
        elements: [
          {
            type: 'circle',
            x: 420,
            y: 80,
            w: 120,
            h: 120,
            fill: '#1f2937',
            stroke: '#374151',
            opacity: 0.85
          },
          {
            type: 'text',
            x: 80,
            y: 80,
            w: 600,
            h: 240,
            text: '“Great design is eliminating all unnecessary details.”\n\n— Minh Tran, Creative Director',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 28,
              color: '#e5e7eb',
              bold: false,
              italic: true,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          }
        ]
      },
      {
        name: 'Closing',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1f1f1f 100%)',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 160,
            w: 640,
            h: 80,
            text: 'Thank You',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 60,
              color: '#ffffff',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'text',
            x: 80,
            y: 260,
            w: 640,
            h: 80,
            text: 'hello@minimaldark.com | +1 (800) 555-0125',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 20,
              color: '#d1d5db',
              bold: false,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          }
        ]
      }
    ]
  }
]
