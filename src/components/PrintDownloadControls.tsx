import { useState } from 'react'
import { CButton } from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilPrint, cilCloudDownload } from '@coreui/icons'
import html2pdf from 'html2pdf.js'
import printJS from 'print-js'
import { useReactToPrint } from 'react-to-print'

interface IOrderControlsProps {
  isDisabled: boolean
  printElement: React.MutableRefObject<HTMLElement> | string
}

const controlsStyles: React.CSSProperties = {
  padding: 3,
  marginTop: 5,
  width: '100%',
  display: 'flex',
  gap: 5,
  justifyContent: 'flex-end',
}

const html2pdfOptions = {
  margin: 10,
  filename: 'document.pdf',
  image: { type: 'jpeg', quality: 1 },
  html2canvas: {
    dpi: 150,
    scale: 4,
    letterRendering: true,
  },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
}

const preparePrintContainer = (
  element: React.MutableRefObject<HTMLElement>,
) => {
  const printContainer = document.createElement('div')
  printContainer.innerHTML = element.current.innerHTML
  const signSec = printContainer.querySelector('.sign-section') as HTMLElement
  if (signSec) signSec.style.display = 'block'

  // Excluding these for print
  const unwantedSelectors = 'button, input, textarea'
  const unwantedItems = printContainer.querySelectorAll(unwantedSelectors)
  unwantedItems.forEach((item) => item.remove())

  return printContainer
}

const PrintDownloadControls = (props: IOrderControlsProps) => {
  const { isDisabled, printElement } = props
  const [isLoading, setIsLoading] = useState(isDisabled)

  const handleDownload = async () => {
    setIsLoading(true)

    if (typeof printElement === 'string') {
      if (printElement.startsWith('http')) {
        const link = document.createElement('a')
        link.href = printElement
        link.click()
        link.remove()
      }
      setIsLoading(false)
      return
    }

    const printContainer = preparePrintContainer(printElement)

    await html2pdf().set(html2pdfOptions).from(printContainer).save()
    printContainer.remove()

    setIsLoading(false)
  }

  const handleReactToPrint = useReactToPrint({
    documentTitle: ' ',
    removeAfterPrint: true,
    pageStyle: `@page { size: A4; }`,
  })

  const handlePrint = () => {
    setIsLoading(true)

    if (typeof printElement === 'string') {
      if (printElement.startsWith('http')) {
        printJS({
          printable: printElement,
          type: 'pdf',
          showModal: true,
        })
      }
      setIsLoading(false)
      return
    }

    const printContainer = preparePrintContainer(printElement)

    handleReactToPrint(null, () => printContainer)
    printContainer.remove()

    setIsLoading(false)
  }

  return (
    <div className="controls" style={controlsStyles}>
      <CButton
        color="primary"
        disabled={isDisabled || isLoading}
        onClick={handlePrint}
      >
        <CIcon icon={cilPrint} style={{ marginRight: 5 }} />
        Печать
      </CButton>

      <CButton
        color="primary"
        disabled={isDisabled || isLoading}
        onClick={handleDownload}
      >
        <CIcon icon={cilCloudDownload} style={{ marginRight: 5 }} />
        Скачать
      </CButton>
    </div>
  )
}

export default PrintDownloadControls
