'use client'

import { useEffect } from 'react'
import { useImportWizard } from '@/hooks/use-import-wizard'
import { UploadStep } from './steps/upload-step'
import { DetectStep } from './steps/detect-step'
import { ValidateStep } from './steps/validate-step'
import { CommitStep } from './steps/commit-step'
import { Progress } from '@/components/ui/progress'

export function ImportWizard() {
  const wizard = useImportWizard()

  // Protect against losing uncommitted changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Show warning if user has uploaded a file but hasn't committed the import
      // Steps 2 and 3 have uncommitted changes (detect/validate but not committed)
      const hasUncommittedChanges = wizard.uploadedFile && wizard.currentStep >= 2 && wizard.currentStep < 4
      
      // Also check if we're on step 4 but the job is still processing
      const isProcessing = wizard.currentStep === 4 && 
        wizard.jobStatus && 
        (wizard.jobStatus.status === 'PENDING' || wizard.jobStatus.status === 'PROCESSING')
      
      if (hasUncommittedChanges || isProcessing) {
        e.preventDefault()
        e.returnValue = 'Uncommitted changes detected'
        return 'Uncommitted changes detected'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [wizard.uploadedFile, wizard.currentStep, wizard.jobStatus])

  const steps = [
    { number: 1, title: 'Upload', description: 'Enviar arquivo CSV' },
    { number: 2, title: 'Detecção', description: 'Configurar mapeamento' },
    { number: 3, title: 'Validação', description: 'Revisar dados' },
    { number: 4, title: 'Importação', description: 'Processar dados' },
  ]

  const progressValue = (wizard.currentStep / steps.length) * 100

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Etapa {wizard.currentStep} de {steps.length}</span>
          <span className="text-muted-foreground">{steps[wizard.currentStep - 1].title}</span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      {/* Steps Navigation */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`
                  flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-colors
                  ${
                    wizard.currentStep === step.number
                      ? 'border-primary bg-primary text-primary-foreground'
                      : wizard.currentStep > step.number
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-muted-foreground/30 bg-background text-muted-foreground'
                  }
                `}
              >
                {step.number}
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs font-medium">{step.title}</p>
                <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  mx-2 h-0.5 w-12 lg:w-24 transition-colors
                  ${wizard.currentStep > step.number ? 'bg-primary' : 'bg-muted-foreground/30'}
                `}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px] rounded-lg border bg-card p-6">
        {wizard.currentStep === 1 && <UploadStep wizard={wizard} />}
        {wizard.currentStep === 2 && <DetectStep wizard={wizard} />}
        {wizard.currentStep === 3 && <ValidateStep wizard={wizard} />}
        {wizard.currentStep === 4 && <CommitStep wizard={wizard} />}
      </div>
    </div>
  )
}
