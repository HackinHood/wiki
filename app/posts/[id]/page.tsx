"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { addToast } from "@heroui/toast"
import { Button } from "@heroui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params?.id as string

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      if (!postId) return null
      
      const response = await fetch(`/api/posts/${postId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch post")
      }
      return response.json()
    },
    enabled: !!postId,
    retry: 1,
  })

  // Format the date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy")
    } catch (e) {
      return "Unknown date"
    }
  }

  // Calculate reading time (200 words per minute)
  const calculateReadingTime = (content) => {
    if (!content) return "< 1 min read"
    
    const text = content.replace(/<[^>]*>/g, "") // Strip HTML tags
    const words = text.split(/\s+/).filter(word => word.length > 0)
    const minutes = Math.ceil(words.length / 200)
    
    return `${minutes} min read`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Button variant="default" onClick={() => router.push("/")}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const createdDate = post.createdAt ? formatDate(post.createdAt) : 
                      post._id ? formatDate(new Date(parseInt(post._id.toString().substring(0, 8), 16) * 1000)) : 
                      "Unknown date"

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6" 
          onClick={() => router.push("/")}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to home
        </Button>

        <article className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap gap-3 items-center text-sm text-muted-foreground mb-8">
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>{createdDate}</span>
            </div>
            <div className="flex items-center">
              <User size={14} className="mr-1" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>{calculateReadingTime(post.content)}</span>
            </div>
          </div>

          {post.tldr && (
            <div className="bg-muted p-4 rounded-md mb-8">
              <h2 className="text-lg font-semibold mb-2">TL;DR</h2>
              <p className="m-0">{post.tldr}</p>
            </div>
          )}

          <div 
            className="post-content" 
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </div>
  )
}