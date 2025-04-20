import { CreatePostForm } from "@/components/create-post-form"

export default function CreatePostPage() {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight mb-6">Create a New Post</h1>
                <CreatePostForm />
            </div>
        </div>
    )
}
