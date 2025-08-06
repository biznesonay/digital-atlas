'use client';

import { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  Stack,
} from '@mui/material';
import {
  CloudUpload,
  Download,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  ExpandMore,
  ExpandLess,
  FileDownload,
  History,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

const steps = ['Выбор файла', 'Проверка данных', 'Импорт', 'Результаты'];

export default function ImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set());

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Проверяем тип файла
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      
      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/)) {
        setError('Пожалуйста, выберите файл Excel (.xlsx или .xls)');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      setActiveStep(1);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setImporting(true);
    setError(null);
    setActiveStep(2);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await apiClient.post('/import/excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setImportResult(response.data);
      setActiveStep(3);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Ошибка при импорте файла');
      setActiveStep(1);
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/import/template`, {
        headers: {
          Authorization: `Bearer ${apiClient.getAccessToken()}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to download template');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'import-template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Ошибка при скачивании шаблона');
    }
  };

  const toggleErrorExpanded = (row: number) => {
    const newExpanded = new Set(expandedErrors);
    if (newExpanded.has(row)) {
      newExpanded.delete(row);
    } else {
      newExpanded.add(row);
    }
    setExpandedErrors(newExpanded);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            <Typography variant="h6" gutterBottom>
              Выберите файл Excel для импорта
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Файл должен соответствовать шаблону импорта
            </Typography>
            
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<CloudUpload />}
                onClick={() => fileInputRef.current?.click()}
              >
                Выбрать файл
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleDownloadTemplate}
              >
                Скачать шаблон
              </Button>
            </Stack>
          </Box>
        );
        
      case 1:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Выбран файл: <strong>{selectedFile?.name}</strong>
            </Alert>
            
            <Typography variant="body1" paragraph>
              Нажмите "Начать импорт" для загрузки данных из файла.
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Система проверит данные и создаст новые объекты в базе данных.
            </Typography>
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleImport}
                disabled={importing}
              >
                Начать импорт
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedFile(null);
                  setActiveStep(0);
                }}
              >
                Выбрать другой файл
              </Button>
            </Box>
          </Box>
        );
        
      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Импорт данных...
            </Typography>
            <LinearProgress sx={{ mt: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Пожалуйста, подождите. Это может занять несколько минут.
            </Typography>
          </Box>
        );
        
      case 3:
        return (
          <Box>
            {importResult && (
              <>
                {/* Статистика */}
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <Paper sx={{ p: 2, flex: 1 }}>
                    <Typography variant="h4" color="primary">
                      {importResult.totalRows}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Всего строк
                    </Typography>
                  </Paper>
                  
                  <Paper sx={{ p: 2, flex: 1 }}>
                    <Typography variant="h4" color="success.main">
                      {importResult.successRows}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Успешно импортировано
                    </Typography>
                  </Paper>
                  
                  <Paper sx={{ p: 2, flex: 1 }}>
                    <Typography variant="h4" color="error.main">
                      {importResult.errorRows}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ошибки
                    </Typography>
                  </Paper>
                </Stack>

                {/* Результат */}
                {importResult.errorRows === 0 ? (
                  <Alert severity="success" icon={<CheckCircle />}>
                    Импорт успешно завершен! Все объекты были добавлены в базу данных.
                  </Alert>
                ) : importResult.successRows > 0 ? (
                  <Alert severity="warning" icon={<Warning />}>
                    Импорт завершен с ошибками. Часть объектов не была импортирована.
                  </Alert>
                ) : (
                  <Alert severity="error" icon={<ErrorIcon />}>
                    Импорт не удался. Проверьте формат файла и данные.
                  </Alert>
                )}

                {/* Таблица ошибок */}
                {importResult.errors && importResult.errors.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Ошибки импорта
                    </Typography>
                    
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell width={80}>Строка</TableCell>
                            <TableCell>Ошибка</TableCell>
                            <TableCell width={50}></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {importResult.errors.map((error: any, index: number) => (
                            <>
                              <TableRow key={index}>
                                <TableCell>
                                  <Chip label={error.row} size="small" />
                                </TableCell>
                                <TableCell>{error.error}</TableCell>
                                <TableCell>
                                  <IconButton
                                    size="small"
                                    onClick={() => toggleErrorExpanded(index)}
                                  >
                                    {expandedErrors.has(index) ? <ExpandLess /> : <ExpandMore />}
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={3} sx={{ p: 0 }}>
                                  <Collapse in={expandedErrors.has(index)}>
                                    <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                                      <Typography variant="caption" component="pre">
                                        {JSON.stringify(error.data, null, 2)}
                                      </Typography>
                                    </Box>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            </>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* Действия */}
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => router.push('/admin/objects')}
                  >
                    Перейти к объектам
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSelectedFile(null);
                      setImportResult(null);
                      setActiveStep(0);
                    }}
                  >
                    Импортировать еще
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<History />}
                    onClick={() => router.push('/admin/import/history')}
                  >
                    История импорта
                  </Button>
                </Box>
              </>
            )}
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Импорт данных
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Загрузите файл Excel с данными объектов для массового добавления в систему
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {renderStepContent()}
      </Paper>
    </Box>
  );
}
