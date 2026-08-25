import React from 'react'
import Modal from '@/components/ui/Modal'
import TaskForm from './TaskForm'

/**
 * Task creation/edit modal.
 *
 * @param {{ isOpen: boolean, onClose: () => void, initialData?: any, onSubmit: (data: any) => Promise<void>, isSubmitting: boolean }} props
 */
export default function TaskModal({ isOpen, onClose, initialData, onSubmit, isSubmitting }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title={initialData ? 'Edit Task' : 'Create Task'}
      size="md"
    >
      <TaskForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
      />
    </Modal>
  )
}
