'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/toaster'
import ImageUpload from '@/components/ui/image-upload'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Mail, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  Shield, 
  FileText, 
  MessageSquare,
  Camera,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar: z.string().optional()
})

type ProfileFormData = z.infer<typeof profileSchema>

interface UserProfile {
  _id: string
  name: string
  email: string
  bio?: string
  avatar?: string
  role: 'admin' | 'author' | 'reader'
  createdAt: string
  updatedAt: string
  postsCount?: number
  commentsCount?: number
}

export default function ProfilePage() {
  const { status, update } = useSession()
  const router = useRouter()
  const { push: toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [updating, setUpdating] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  })

  const watchedAvatar = watch('avatar')

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        
        // Set form values
        setValue('name', data.user.name)
        setValue('email', data.user.email)
        setValue('bio', data.user.bio || '')
        setValue('avatar', data.user.avatar || '')
      } else {
        toast({
          type: 'error',
          title: 'Failed to load profile',
          description: 'Please try refreshing the page.'
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        type: 'error',
        title: 'Error loading profile',
        description: 'Please check your connection and try again.'
      })
    } finally {
      setLoading(false)
    }
  }, [setValue, toast])

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    fetchProfile()
  }, [status, router, fetchProfile])

  const onSubmit = async (data: ProfileFormData) => {
    setUpdating(true)
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile.user)
        setEditing(false)
        
        toast({
          type: 'success',
          title: 'Profile updated!',
          description: 'Your profile has been successfully updated.'
        })
        
        // Update session with new data
        await update({
          name: data.name,
          email: data.email,
          avatar: data.avatar
        })
      } else {
        const errorData = await response.json()
        toast({
          type: 'error',
          title: 'Update failed',
          description: errorData.error || 'Failed to update profile. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        type: 'error',
        title: 'Network error',
        description: 'Please check your connection and try again.'
      })
    } finally {
      setUpdating(false)
    }
  }

  const cancelEdit = () => {
    setEditing(false)
    if (profile) {
      reset({
        name: profile.name,
        email: profile.email,
        bio: profile.bio || '',
        avatar: profile.avatar || ''
      })
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'author': return 'default'
      default: return 'secondary'
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load profile data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              type="submit" 
              form="profile-form"
              disabled={updating}
              className="flex items-center gap-2"
            >
              {updating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={cancelEdit}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                {/* Avatar Section */}
                <div className="relative group">
                  <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 ring-4 ring-white shadow-xl">
                    {(editing ? watchedAvatar : profile.avatar) ? (
                      <img
                        src={editing ? watchedAvatar : profile.avatar}
                        alt={profile.name}
                        className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                                <span class="text-white text-xl font-bold">${getInitials(profile.name)}</span>
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                        <span className="text-white text-xl font-bold">
                          {getInitials(profile.name)}
                        </span>
                      </div>
                    )}
                    {editing && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm">
                        <div className="text-center">
                          <Camera className="h-6 w-6 text-white mx-auto mb-1" />
                          <span className="text-xs text-white font-medium">Change</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-semibold">{profile.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Mail className="h-3 w-3" />
                    {profile.email}
                  </p>
                  <Badge variant={getRoleBadgeVariant(profile.role)} className="mt-2">
                    <Shield className="h-3 w-3 mr-1" />
                    {profile.role}
                  </Badge>
                </div>

                <Separator />

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{profile.postsCount || 0}</div>
                    <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                      <FileText className="h-3 w-3" />
                      Posts
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{profile.commentsCount || 0}</div>
                    <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      Comments
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-500">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  Joined {format(new Date(profile.createdAt), 'MMMM yyyy')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your personal information and profile settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Avatar Upload */}
                {editing && (
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Profile Picture</Label>
                    <ImageUpload
                      currentImage={watchedAvatar || ''}
                      onUpload={(url: string) => setValue('avatar', url)}
                      onRemove={() => setValue('avatar', '')}
                      label="Upload or change your profile picture"
                    />
                  </div>
                )}

                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      disabled={!editing}
                      {...register('name')}
                      className={!editing ? 'bg-gray-50' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      disabled={!editing}
                      {...register('email')}
                      className={!editing ? 'bg-gray-50' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    disabled={!editing}
                    rows={4}
                    {...register('bio')}
                    className={!editing ? 'bg-gray-50' : ''}
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-600">{errors.bio.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {watch('bio')?.length || 0}/500 characters
                  </p>
                </div>

                {!editing && profile.bio && (
                  <div className="space-y-2">
                    <Label>About</Label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-gray-700">{profile.bio}</p>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}