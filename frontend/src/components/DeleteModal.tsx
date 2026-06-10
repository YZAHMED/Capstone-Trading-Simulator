interface Props {
  name: string
  onConfirm: () => void
  onCancel: () => void
}

function DeleteModal({ name, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Confirm delete</h2>
        <p className="text-gray-700">
          Are you sure you want to delete{' '}
          <span className="font-semibold">"{name}"</span>?
        </p>
        <p className="text-sm text-red-600 mt-1">This cannot be undone.</p>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal
