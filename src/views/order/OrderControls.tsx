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
  margin: 3,
  marginLeft: 10,
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

const OrderControls = ({ isDisabled, printElement }: IOrderControlsProps) => {
  const handleDownload = async () => {
    if (typeof printElement === 'string') {
      if (printElement.startsWith('http')) {
        const link = document.createElement('a')
        link.href = printElement
        link.click()
        link.remove()
      }
      return
    }

    const printContainer = preparePrintContainer(printElement)

    await html2pdf().set(html2pdfOptions).from(printContainer).save()
    printContainer.remove()
  }

  const handleReactToPrint = useReactToPrint({
    documentTitle: 'Print',
    removeAfterPrint: true,
  })

  const handlePrint = () => {
    if (typeof printElement === 'string') {
      if (printElement.startsWith('http')) {
        printJS({
          printable: printElement,
          type: 'pdf',
          showModal: true,
        })
      }
      return
    }

    const printContainer = preparePrintContainer(printElement)

    // For Mozilla Firefox this works better
    if (navigator.userAgent.includes('Firefox')) {
      return handleReactToPrint(null, () => printContainer)
    }

    html2pdf()
      .set(html2pdfOptions)
      .from(printContainer)
      .outputPdf()
      .then((pdf: string) => {
        printJS({ printable: btoa(pdf), type: 'pdf', base64: true })
      })
      .finally(() => {
        printContainer.remove()
      })
  }

  return (
    <div className="controls" style={controlsStyles}>
      <CButton color="primary" disabled={isDisabled} onClick={handlePrint}>
        <CIcon icon={cilPrint} style={{ marginRight: 5 }} />
        Печать
      </CButton>

      <CButton color="primary" disabled={isDisabled} onClick={handleDownload}>
        <CIcon icon={cilCloudDownload} style={{ marginRight: 5 }} />
        Скачать
      </CButton>
    </div>
  )
}

export default OrderControls
