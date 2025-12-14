import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'

const Profile = () => {
  const { user, logout } = useAuth()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    // In a real app, this would call an API to update user data
    setEditing(false)
  }

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
            Profile
          </h1>
          <p className="text-dark-muted">
            Manage your account settings
          </p>
        </div>

        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-8 mb-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-dark-border">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-primary to-accent-success rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-display font-bold text-white">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
              <p className="text-dark-muted">{user?.email}</p>
              <p className="text-xs text-dark-muted mt-1">
                Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Personal Information</h3>
              <Button
                variant={editing ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Cancel' : 'Edit'}
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!editing}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={true}
              />
              <Input
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Not set"
              />
            </div>

            {editing && (
              <div className="flex justify-end">
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            )}
          </div>
        </div>

        {/* Account Stats */}
        <div className="glass-card rounded-2xl p-8 mb-6">
          <h3 className="font-semibold text-white mb-6">Account Overview</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-4 bg-dark-tertiary rounded-xl">
              <p className="text-sm text-dark-muted mb-1">Wallet Balance</p>
              <p className="text-2xl font-display font-bold text-white">
                ₹{user?.wallet?.balance?.toLocaleString('en-IN') || '0'}
              </p>
            </div>
            <div className="p-4 bg-dark-tertiary rounded-xl">
              <p className="text-sm text-dark-muted mb-1">Holdings</p>
              <p className="text-2xl font-display font-bold text-white">
                {user?.holdings?.length || 0}
              </p>
            </div>
            <div className="p-4 bg-dark-tertiary rounded-xl">
              <p className="text-sm text-dark-muted mb-1">Transactions</p>
              <p className="text-2xl font-display font-bold text-white">
                {user?.wallet?.transactions?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="glass-card rounded-2xl p-8 mb-6">
          <h3 className="font-semibold text-white mb-6">Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-tertiary rounded-xl">
              <div>
                <p className="font-medium text-white">Password</p>
                <p className="text-sm text-dark-muted">Last changed never</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-dark-tertiary rounded-xl">
              <div>
                <p className="font-medium text-white">Two-Factor Authentication</p>
                <p className="text-sm text-dark-muted">Add an extra layer of security</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-card rounded-2xl p-8 border border-accent-danger/20">
          <h3 className="font-semibold text-accent-danger mb-6">Danger Zone</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Sign out of your account</p>
              <p className="text-sm text-dark-muted">You will need to sign in again</p>
            </div>
            <Button variant="danger" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile


