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
      },
      {
        name: 'Campaign Performance',
        background: '#fff5f7',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Campaign Performance',
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
            type: 'table',
            x: 80,
            y: 110,
            w: 640,
            h: 260,
            rows: 4,
            cols: 4,
            headerRow: true,
            headerBg: '#f093fb',
            headerTextColor: '#ffffff',
            cellBg: '#ffffff',
            borderColor: '#fde4ff',
            cells: [
              { text: 'Campaign', styles: { bold: true, align: 'left', fontSize: 16 } },
              { text: 'Impressions', styles: { bold: true, align: 'center', fontSize: 16 } },
              { text: 'CTR', styles: { bold: true, align: 'center', fontSize: 16 } },
              { text: 'CPA', styles: { bold: true, align: 'center', fontSize: 16 } },
              { text: 'Brand Awareness', styles: { align: 'left', fontSize: 14 } },
              { text: '1.2M', styles: { align: 'center', fontSize: 14 } },
              { text: '3.4%', styles: { align: 'center', fontSize: 14 } },
              { text: '$12.40', styles: { align: 'center', fontSize: 14 } },
              { text: 'Product Launch', styles: { align: 'left', fontSize: 14 } },
              { text: '860K', styles: { align: 'center', fontSize: 14 } },
              { text: '4.1%', styles: { align: 'center', fontSize: 14 } },
              { text: '$9.80', styles: { align: 'center', fontSize: 14 } },
              { text: 'Retargeting', styles: { align: 'left', fontSize: 14 } },
              { text: '540K', styles: { align: 'center', fontSize: 14 } },
              { text: '6.2%', styles: { align: 'center', fontSize: 14 } },
              { text: '$7.10', styles: { align: 'center', fontSize: 14 } }
            ]
          }
        ]
      },
      {
        name: 'Social Highlights',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Social Highlights',
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
            type: 'image',
            x: 80,
            y: 120,
            w: 320,
            h: 220,
            rotation: 0,
            src: 'https://via.placeholder.com/320x220/f093fb/ffffff?text=Campaign',
            opacity: 1,
            showTitle: false,
            showCaption: false,
            cornerRadiusTL: 12,
            cornerRadiusTR: 12,
            cornerRadiusBR: 12,
            cornerRadiusBL: 12,
            filterPreset: 'original',
            filterStrength: 1
          },
          {
            type: 'text',
            x: 420,
            y: 120,
            w: 300,
            h: 140,
            text: 'Best performing post\n• 92K impressions\n• 8.5K saves\n• 2.1K shares',
            bgColor: '#fff5f7',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 20,
              color: '#f5576c',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'bullet'
            }
          },
          {
            type: 'text',
            x: 420,
            y: 280,
            w: 300,
            h: 120,
            text: 'Community takeaway:\n“Behind-the-scenes clips and quick tips outperformed polished ads by 34%.”',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 18,
              color: '#444444',
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
        name: 'Funnel Analysis',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Funnel Analysis',
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
            chartType: 'bar',
            chartStyle: 'vertical',
            x: 80,
            y: 110,
            w: 640,
            h: 300,
            structuredData: {
              categories: ['Awareness', 'Consideration', 'Intent', 'Purchase'],
              series: [
                { name: 'Visitors', data: [12000, 6200, 2800, 950] },
                { name: 'Leads', data: [4200, 2600, 1400, 620] }
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
        name: 'Persona Cards',
        background: '#fffaf0',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Audience Personas',
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
            type: 'rect',
            x: 80,
            y: 120,
            w: 180,
            h: 200,
            fill: '#fde7f3',
            stroke: '#f093fb',
            opacity: 1
          },
          {
            type: 'text',
            x: 90,
            y: 130,
            w: 160,
            h: 180,
            text: 'Creator Chloe\n• 27 yrs, USA\n• Lives on IG Reels\n• Wants trend insights',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              color: '#333333',
              bold: false,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'bullet'
            }
          },
          {
            type: 'rect',
            x: 300,
            y: 120,
            w: 180,
            h: 200,
            fill: '#ffe9e2',
            stroke: '#f5576c',
            opacity: 1
          },
          {
            type: 'text',
            x: 310,
            y: 130,
            w: 160,
            h: 180,
            text: 'Founder Felix\n• 34 yrs, UK\n• Evaluates ROI weekly\n• Prefers concise dashboards',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              color: '#333333',
              bold: false,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'bullet'
            }
          },
          {
            type: 'rect',
            x: 520,
            y: 120,
            w: 180,
            h: 200,
            fill: '#fff5d9',
            stroke: '#f8a300',
            opacity: 1
          },
          {
            type: 'text',
            x: 530,
            y: 130,
            w: 160,
            h: 180,
            text: 'Manager Maya\n• 41 yrs, EU\n• Loves templates\n• Needs ready-to-share decks',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
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
        name: 'Budget Allocation',
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
            chartType: 'pie',
            chartStyle: 'donut',
            x: 200,
            y: 110,
            w: 400,
            h: 300,
            structuredData: {
              categories: ['Paid Media', 'Content', 'Events', 'Tools', 'Community'],
              series: [{ name: 'Budget %', data: [32, 22, 16, 18, 12] }]
            },
            legendOptions: {
              show: true
            }
          }
        ]
      },
      {
        name: 'Content Calendar',
        background: '#fffdf5',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Content Calendar',
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
            type: 'rect',
            x: 80,
            y: 120,
            w: 560,
            h: 40,
            fill: '#fde7f3',
            stroke: '#f093fb',
            opacity: 1
          },
          {
            type: 'text',
            x: 90,
            y: 125,
            w: 540,
            h: 30,
            text: 'Week 1 – Launch hero video + blog article',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 18,
              color: '#f5576c',
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
            y: 180,
            w: 560,
            h: 40,
            fill: '#ffe6e0',
            stroke: '#f57373',
            opacity: 1
          },
          {
            type: 'text',
            x: 90,
            y: 185,
            w: 540,
            h: 30,
            text: 'Week 2 – Webinar promo + influencer collab',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 18,
              color: '#f5576c',
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
            y: 240,
            w: 560,
            h: 40,
            fill: '#fff6d8',
            stroke: '#f5c06b',
            opacity: 1
          },
          {
            type: 'text',
            x: 90,
            y: 245,
            w: 540,
            h: 30,
            text: 'Week 3 – Case study drop + paid remarketing',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 18,
              color: '#f5576c',
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
            y: 300,
            w: 560,
            h: 40,
            fill: '#e9fbff',
            stroke: '#64d2ff',
            opacity: 1
          },
          {
            type: 'text',
            x: 90,
            y: 305,
            w: 540,
            h: 30,
            text: 'Week 4 – Community AMA + recap report',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 18,
              color: '#f5576c',
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
        name: 'Next Steps',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 80,
            text: 'Next Steps & Owners',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 42,
              color: '#f5576c',
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
            h: 200,
            text: '• Finalize creative refresh – Design team (Due Friday)\n• Launch nurture sequence – Automation squad (Due Tuesday)\n• Approve event sponsorships – Leadership (Due next sprint)',
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
          },
          {
            type: 'rect',
            x: 80,
            y: 320,
            w: 640,
            h: 60,
            fill: '#fff0f3',
            stroke: '#f093fb',
            opacity: 1
          },
          {
            type: 'text',
            x: 100,
            y: 330,
            w: 600,
            h: 40,
            text: 'Reminder: Share progress snapshot in #marketing-sync every Thursday.',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 20,
              color: '#f5576c',
              bold: true,
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
      },
      {
        name: 'Project Scope',
        background: '#f5fbff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 60,
            text: 'Scope & Objectives',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 40,
              color: '#00aaff',
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
            y: 120,
            w: 640,
            h: 220,
            text: '• Build unified analytics workspace for all departments\n• Integrate 6 key data sources and automate QA checks\n• Launch pilot with CS + Marketing teams by Week 10\n• Document governance + training materials',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 26,
              color: '#1f2933',
              bold: false,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'bullet'
            }
          },
          {
            type: 'rect',
            x: 80,
            y: 320,
            w: 640,
            h: 60,
            fill: '#e1f5ff',
            stroke: '#4facfe',
            opacity: 1
          },
          {
            type: 'text',
            x: 100,
            y: 330,
            w: 600,
            h: 40,
            text: 'Success metric: 30% reduction in manual reporting time.',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 22,
              color: '#0077cc',
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
        name: 'Timeline Overview',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 60,
            text: 'Timeline Overview',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 40,
              color: '#00f2fe',
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
            w: 140,
            h: 90,
            fill: '#e0f7ff',
            stroke: '#4facfe',
            opacity: 1
          },
          {
            type: 'text',
            x: 90,
            y: 140,
            w: 120,
            h: 70,
            text: 'Phase 1\nDiscovery\nWeeks 1-2',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              color: '#0f172a',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'rect',
            x: 240,
            y: 130,
            w: 140,
            h: 90,
            fill: '#d0f8f9',
            stroke: '#00f2fe',
            opacity: 1
          },
          {
            type: 'text',
            x: 250,
            y: 140,
            w: 120,
            h: 70,
            text: 'Phase 2\nBuild\nWeeks 3-6',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              color: '#0f172a',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'rect',
            x: 400,
            y: 130,
            w: 140,
            h: 90,
            fill: '#c8f6ff',
            stroke: '#00c2ff',
            opacity: 1
          },
          {
            type: 'text',
            x: 410,
            y: 140,
            w: 120,
            h: 70,
            text: 'Phase 3\nPilot\nWeeks 7-9',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              color: '#0f172a',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'rect',
            x: 560,
            y: 130,
            w: 140,
            h: 90,
            fill: '#b8f2ff',
            stroke: '#00a6d6',
            opacity: 1
          },
          {
            type: 'text',
            x: 570,
            y: 140,
            w: 120,
            h: 70,
            text: 'Phase 4\nRollout\nWeeks 10-12',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              color: '#0f172a',
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
        name: 'Resource Plan',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 60,
            text: 'Resource Plan',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 40,
              color: '#4facfe',
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
            y: 120,
            w: 640,
            h: 260,
            rows: 4,
            cols: 4,
            headerRow: true,
            headerBg: '#e0f3ff',
            headerTextColor: '#0f172a',
            cellBg: '#ffffff',
            borderColor: '#dbeafe',
            cells: [
              { text: 'Role', styles: { align: 'left', bold: true, fontSize: 16 } },
              { text: 'Owner', styles: { align: 'center', bold: true, fontSize: 16 } },
              { text: 'Allocation', styles: { align: 'center', bold: true, fontSize: 16 } },
              { text: 'Notes', styles: { align: 'center', bold: true, fontSize: 16 } },
              { text: 'Project Lead', styles: { align: 'left', fontSize: 14 } },
              { text: 'Amelia', styles: { align: 'center', fontSize: 14 } },
              { text: '60%', styles: { align: 'center', fontSize: 14 } },
              { text: 'Exec updates', styles: { align: 'left', fontSize: 14 } },
              { text: 'Data Engineer', styles: { align: 'left', fontSize: 14 } },
              { text: 'Leo', styles: { align: 'center', fontSize: 14 } },
              { text: '80%', styles: { align: 'center', fontSize: 14 } },
              { text: 'Pipelines', styles: { align: 'left', fontSize: 14 } },
              { text: 'Designer', styles: { align: 'left', fontSize: 14 } },
              { text: 'Priya', styles: { align: 'center', fontSize: 14 } },
              { text: '40%', styles: { align: 'center', fontSize: 14 } },
              { text: 'Dashboards', styles: { align: 'left', fontSize: 14 } }
            ]
          }
        ]
      },
      {
        name: 'Cost Forecast',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Cost Forecast',
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
            chartType: 'line',
            chartStyle: 'smooth',
            x: 80,
            y: 110,
            w: 640,
            h: 300,
            structuredData: {
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              series: [
                { name: 'Projected ($K)', data: [40, 55, 70, 85, 95, 110] },
                { name: 'Actual ($K)', data: [38, 54, 72, 82, 90, 0] }
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
        name: 'Risk Matrix',
        background: '#f8feff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Risk Matrix',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#00a6d6',
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
            w: 200,
            h: 120,
            fill: '#fff5f5',
            stroke: '#fecaca',
            opacity: 1
          },
          {
            type: 'text',
            x: 90,
            y: 130,
            w: 180,
            h: 100,
            text: 'Integration delays\nLikelihood: High\nImpact: High',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              color: '#991b1b',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'rect',
            x: 320,
            y: 120,
            w: 200,
            h: 120,
            fill: '#fffbea',
            stroke: '#fde68a',
            opacity: 1
          },
          {
            type: 'text',
            x: 330,
            y: 130,
            w: 180,
            h: 100,
            text: 'Change requests\nLikelihood: Medium\nImpact: Medium',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              color: '#92400e',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'rect',
            x: 560,
            y: 120,
            w: 200,
            h: 120,
            fill: '#ecfdf5',
            stroke: '#a7f3d0',
            opacity: 1
          },
          {
            type: 'text',
            x: 570,
            y: 130,
            w: 180,
            h: 100,
            text: 'Resource churn\nLikelihood: Low\nImpact: Medium',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              color: '#065f46',
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
        name: 'Deliverables',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Deliverables Preview',
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
            type: 'image',
            x: 120,
            y: 110,
            w: 520,
            h: 240,
            rotation: 0,
            src: 'https://via.placeholder.com/520x240/4facfe/ffffff?text=Dashboard+Mock',
            opacity: 1,
            showTitle: false,
            showCaption: false,
            cornerRadiusTL: 12,
            cornerRadiusTR: 12,
            cornerRadiusBR: 12,
            cornerRadiusBL: 12,
            filterPreset: 'original',
            filterStrength: 1
          }
        ]
      },
      {
        name: 'Next Actions',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 60,
            text: 'Next Actions',
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
            y: 120,
            w: 640,
            h: 220,
            text: '• Confirm stakeholder sign-off (Due Friday)\n• Finalize vendor contracts (Due next Tuesday)\n• Schedule pilot readiness review (Week 6)\n• Prepare training assets (Week 8)',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 26,
              color: '#1f2933',
              bold: false,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'bullet'
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
      },
      {
        name: 'Problem & Opportunity',
        background: '#fff8f2',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 50,
            w: 640,
            h: 60,
            text: 'Problem & Opportunity',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 44,
              color: '#fa709a',
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
            y: 130,
            w: 640,
            h: 220,
            text: '• Teams lose 6+ hours/week stitching tools together\n• Customers expect instant personalization, but data is siloed\n• Our platform unifies workflows and automates decisioning',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 28,
              color: '#1f2933',
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
        name: 'Product Sneak Peek',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Product Sneak Peek',
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
            type: 'image',
            x: 120,
            y: 110,
            w: 520,
            h: 260,
            rotation: 0,
            src: 'https://via.placeholder.com/520x260/fa709a/ffffff?text=Product+UI',
            opacity: 1,
            showTitle: false,
            showCaption: false,
            cornerRadiusTL: 16,
            cornerRadiusTR: 16,
            cornerRadiusBR: 16,
            cornerRadiusBL: 16,
            filterPreset: 'original',
            filterStrength: 1
          }
        ]
      },
      {
        name: 'Revenue Streams',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Revenue Streams',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#feb562',
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
            chartStyle: 'grouped',
            x: 80,
            y: 110,
            w: 640,
            h: 300,
            structuredData: {
              categories: ['Q1', 'Q2', 'Q3', 'Q4'],
              series: [
                { name: 'Subscriptions', data: [120, 180, 240, 320] },
                { name: 'Marketplace', data: [40, 55, 70, 95] }
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
        name: 'Roadmap',
        background: '#fffdf0',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Roadmap',
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
            type: 'rect',
            x: 80,
            y: 120,
            w: 180,
            h: 100,
            fill: '#ffe9f2',
            stroke: '#fa709a',
            opacity: 1
          },
          {
            type: 'text',
            x: 90,
            y: 130,
            w: 160,
            h: 80,
            text: 'Q1\nMobile MVP\nBeta partners onboard',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              color: '#1f2933',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'rect',
            x: 300,
            y: 120,
            w: 180,
            h: 100,
            fill: '#fff6d8',
            stroke: '#feb562',
            opacity: 1
          },
          {
            type: 'text',
            x: 310,
            y: 130,
            w: 160,
            h: 80,
            text: 'Q2\nWorkflow builder\nAPI marketplace',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              color: '#1f2933',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'rect',
            x: 520,
            y: 120,
            w: 180,
            h: 100,
            fill: '#e9ffe4',
            stroke: '#55d66b',
            opacity: 1
          },
          {
            type: 'text',
            x: 530,
            y: 130,
            w: 160,
            h: 80,
            text: 'Q3\nAI assistant\nInternational launch',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              color: '#1f2933',
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
        name: 'Team',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Team',
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
            type: 'circle',
            x: 140,
            y: 120,
            w: 140,
            h: 140,
            fill: '#ffe4ef',
            stroke: '#fa709a',
            opacity: 1
          },
          {
            type: 'text',
            x: 140,
            y: 270,
            w: 140,
            h: 80,
            text: 'Ava — CEO\nex-Stripe, product',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              color: '#111827',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'circle',
            x: 320,
            y: 120,
            w: 140,
            h: 140,
            fill: '#fff4da',
            stroke: '#feb562',
            opacity: 1
          },
          {
            type: 'text',
            x: 320,
            y: 270,
            w: 140,
            h: 80,
            text: 'Milo — CTO\nex-Google, infra',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              color: '#111827',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'circle',
            x: 500,
            y: 120,
            w: 140,
            h: 140,
            fill: '#e8fff2',
            stroke: '#55d66b',
            opacity: 1
          },
          {
            type: 'text',
            x: 500,
            y: 270,
            w: 140,
            h: 80,
            text: 'Lena — COO\nex-Airbnb, ops',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              color: '#111827',
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
        name: 'KPI Dashboard',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'KPI Dashboard',
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
            type: 'table',
            x: 80,
            y: 110,
            w: 640,
            h: 260,
            rows: 4,
            cols: 4,
            headerRow: true,
            headerBg: '#fff1f8',
            headerTextColor: '#fa709a',
            cellBg: '#ffffff',
            borderColor: '#ffe0ec',
            cells: [
              { text: 'Metric', styles: { align: 'left', bold: true, fontSize: 16 } },
              { text: 'Current', styles: { align: 'center', bold: true, fontSize: 16 } },
              { text: 'Goal', styles: { align: 'center', bold: true, fontSize: 16 } },
              { text: 'Status', styles: { align: 'center', bold: true, fontSize: 16 } },
              { text: 'ARR', styles: { align: 'left', fontSize: 14 } },
              { text: '$1.4M', styles: { align: 'center', fontSize: 14 } },
              { text: '$2.0M', styles: { align: 'center', fontSize: 14 } },
              { text: '⬆︎ On track', styles: { align: 'center', fontSize: 14 } },
              { text: 'Net Retention', styles: { align: 'left', fontSize: 14 } },
              { text: '136%', styles: { align: 'center', fontSize: 14 } },
              { text: '140%', styles: { align: 'center', fontSize: 14 } },
              { text: '▲ Healthy', styles: { align: 'center', fontSize: 14 } },
              { text: 'Payback (mo)', styles: { align: 'left', fontSize: 14 } },
              { text: '11.2', styles: { align: 'center', fontSize: 14 } },
              { text: '10.0', styles: { align: 'center', fontSize: 14 } },
              { text: '⚠ Optimize', styles: { align: 'center', fontSize: 14 } }
            ]
          }
        ]
      },
      {
        name: 'The Ask',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 60,
            w: 640,
            h: 60,
            text: 'The Ask',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 44,
              color: '#fa709a',
              bold: true,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'none'
            }
          },
          {
            type: 'text',
            x: 120,
            y: 150,
            w: 520,
            h: 160,
            text: 'Raising $6M Seed Round\n• 60% product + engineering\n• 25% go-to-market\n• 15% community & ops',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 30,
              color: '#111827',
              bold: false,
              italic: false,
              underline: false,
              align: 'center',
              listStyle: 'bullet'
            }
          },
          {
            type: 'rect',
            x: 160,
            y: 320,
            w: 440,
            h: 70,
            fill: '#ffeaf3',
            stroke: '#fa709a',
            opacity: 1
          },
          {
            type: 'text',
            x: 170,
            y: 335,
            w: 420,
            h: 40,
            text: 'Join us to ship the operating system for modern teams.',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 22,
              color: '#fa709a',
              bold: true,
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
      },
      {
        name: 'Agenda',
        background: '#fcfffe',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 50,
            w: 640,
            h: 50,
            text: 'Agenda',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 40,
              color: '#1abc9c',
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
            w: 640,
            h: 220,
            fill: '#f0fbff',
            stroke: '#a8edea',
            opacity: 1
          },
          {
            type: 'text',
            x: 100,
            y: 135,
            w: 600,
            h: 190,
            text: '1. Warm-up discussion (10 min)\n2. Mini lecture & demos (20 min)\n3. Group activity (15 min)\n4. Reflection & exit ticket (5 min)',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 24,
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
        name: 'Data Snapshot',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Data Snapshot',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#e67e22',
              bold: true,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'none'
            }
          },
          {
            type: 'chart',
            chartType: 'column',
            chartStyle: 'vertical',
            x: 80,
            y: 110,
            w: 640,
            h: 300,
            structuredData: {
              categories: ['Pre-test', 'Quiz 1', 'Quiz 2', 'Project'],
              series: [
                { name: 'Class Average', data: [62, 74, 81, 88] },
                { name: 'Target', data: [70, 75, 80, 90] }
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
        name: 'Interactive Activity',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Interactive Activity',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#c0392b',
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
            w: 640,
            h: 200,
            fill: '#fff5f2',
            stroke: '#fab1a0',
            opacity: 1
          },
          {
            type: 'text',
            x: 100,
            y: 135,
            w: 600,
            h: 170,
            text: 'Directions:\n• Form groups of 3-4\n• Analyze the scenario card provided\n• Outline 2 possible solutions and pick a favorite\n• Share outcomes on sticky notes',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 24,
              color: '#2c3e50',
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
        name: 'Case Study',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Case Study',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#16a085',
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
            w: 320,
            h: 220,
            rotation: 0,
            src: 'https://via.placeholder.com/320x220/16a085/ffffff?text=Case+Visual',
            opacity: 1,
            showTitle: false,
            showCaption: false,
            cornerRadiusTL: 12,
            cornerRadiusTR: 12,
            cornerRadiusBR: 12,
            cornerRadiusBL: 12,
            filterPreset: 'original',
            filterStrength: 1
          },
          {
            type: 'text',
            x: 420,
            y: 110,
            w: 300,
            h: 220,
            text: 'Scenario summary:\n\nStudents explore how a community garden improved local food access. Discuss budget choices, stakeholder mapping, and outcomes.',
            bgColor: 'transparent',
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
      },
      {
        name: 'Timeline',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Unit Timeline',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#2980b9',
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
            w: 560,
            h: 60,
            fill: '#e8f6ff',
            stroke: '#a8edea',
            opacity: 1
          },
          {
            type: 'text',
            x: 90,
            y: 130,
            w: 540,
            h: 40,
            text: 'Week 1 — Intro & diagnostics',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 20,
              color: '#2c3e50',
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
            y: 200,
            w: 560,
            h: 60,
            fill: '#fff5e9',
            stroke: '#ffd2a5',
            opacity: 1
          },
          {
            type: 'text',
            x: 90,
            y: 210,
            w: 540,
            h: 40,
            text: 'Week 2 — Hands-on experiments',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 20,
              color: '#2c3e50',
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
            y: 280,
            w: 560,
            h: 60,
            fill: '#f4ecff',
            stroke: '#d6c7ff',
            opacity: 1
          },
          {
            type: 'text',
            x: 90,
            y: 290,
            w: 540,
            h: 40,
            text: 'Week 3 — Project build & showcase',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 20,
              color: '#2c3e50',
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
        name: 'Key Statistics',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 40,
            w: 640,
            h: 50,
            text: 'Key Statistics',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 38,
              color: '#8e44ad',
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
            rows: 4,
            cols: 4,
            headerRow: true,
            headerBg: '#f5e9ff',
            headerTextColor: '#6c3ea5',
            cellBg: '#ffffff',
            borderColor: '#eadbf9',
            cells: [
              { text: 'Category', styles: { align: 'left', bold: true, fontSize: 16 } },
              { text: 'Metric', styles: { align: 'center', bold: true, fontSize: 16 } },
              { text: 'Goal', styles: { align: 'center', bold: true, fontSize: 16 } },
              { text: 'Status', styles: { align: 'center', bold: true, fontSize: 16 } },
              { text: 'Participation', styles: { align: 'left', fontSize: 14 } },
              { text: '92%', styles: { align: 'center', fontSize: 14 } },
              { text: '90%', styles: { align: 'center', fontSize: 14 } },
              { text: 'On Track', styles: { align: 'center', fontSize: 14 } },
              { text: 'Homework', styles: { align: 'left', fontSize: 14 } },
              { text: '88%', styles: { align: 'center', fontSize: 14 } },
              { text: '85%', styles: { align: 'center', fontSize: 14 } },
              { text: 'On Track', styles: { align: 'center', fontSize: 14 } },
              { text: 'Project rubric', styles: { align: 'left', fontSize: 14 } },
              { text: '4.2/5', styles: { align: 'center', fontSize: 14 } },
              { text: '4.5/5', styles: { align: 'center', fontSize: 14 } },
              { text: 'Needs Support', styles: { align: 'center', fontSize: 14 } }
            ]
          }
        ]
      },
      {
        name: 'Summary & Next Steps',
        background: '#ffffff',
        elements: [
          {
            type: 'text',
            x: 80,
            y: 50,
            w: 640,
            h: 60,
            text: 'Summary & Next Steps',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 42,
              color: '#2c3e50',
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
            y: 130,
            w: 640,
            h: 220,
            text: '• Recap: highlight key concept takeaways\n• Exit ticket: students answer one reflective prompt\n• Homework: watch 5-minute video + jot 3 questions\n• Next lesson preview: applying concepts in project teams',
            bgColor: 'transparent',
            styles: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 26,
              color: '#2c3e50',
              bold: false,
              italic: false,
              underline: false,
              align: 'left',
              listStyle: 'bullet'
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
