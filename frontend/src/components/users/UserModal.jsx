import Modal from '@/components/ui/Modal'
import UserForm from './UserForm'

export default function UserModal({ isOpen, onClose, initialData, onSubmit, isSubmitting }) {
  const isEditMode = !!initialData

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit User' : 'Create User'}
      maxWidth="md"
    >
      <UserForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
      />
    </Modal>
  )
}
