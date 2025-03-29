import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  HelpCircle, FileQuestion, Book, BookOpen, MessageSquare, Search, CheckCircle, 
  CopyCheck, ArrowRight, ExternalLink, Download, Send, Video, Copy, ChevronRight
} from 'lucide-react';

// Support request schema
const supportRequestSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
  priority: z.enum(["low", "medium", "high"]),
  email: z.string().email("Please enter a valid email address"),
});

type SupportRequestValues = z.infer<typeof supportRequestSchema>;

// FAQ item type
interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Documentation item type
interface DocItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
}

export default function Help() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Support request form
  const supportForm = useForm<SupportRequestValues>({
    resolver: zodResolver(supportRequestSchema),
    defaultValues: {
      subject: '',
      message: '',
      priority: 'medium',
      email: '',
    },
  });
  
  // FAQ data
  const { data: faqItems } = useQuery<FaqItem[]>({
    queryKey: ['/api/admin/help/faq'],
  });
  
  // Documentation data
  const { data: docItems } = useQuery<DocItem[]>({
    queryKey: ['/api/admin/help/docs'],
  });
  
  // Filter items based on search query
  const filteredFaqs = faqItems?.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredDocs = docItems?.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Submit support request
  const onSubmitSupportRequest = (data: SupportRequestValues) => {
    console.log('Support request:', data);
    
    // Show success message
    toast({
      title: 'Support Request Sent',
      description: 'We\'ll get back to you as soon as possible.',
    });
    
    // Reset form
    supportForm.reset();
  };
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">
          Find answers to common questions and get support
        </p>
      </div>
      
      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search for help topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="faqs" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="faqs">
            <FileQuestion className="mr-2 h-4 w-4" />
            <span>FAQs</span>
          </TabsTrigger>
          <TabsTrigger value="docs">
            <Book className="mr-2 h-4 w-4" />
            <span>Documentation</span>
          </TabsTrigger>
          <TabsTrigger value="support">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Contact Support</span>
          </TabsTrigger>
        </TabsList>
        
        {/* FAQs Tab */}
        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to common questions about the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {searchQuery && filteredFaqs && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    {filteredFaqs.length} results found for "{searchQuery}"
                  </p>
                </div>
              )}
              
              {filteredFaqs && filteredFaqs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger>
                        <div className="flex items-start text-left">
                          <span>{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-2 pb-4 text-muted-foreground">
                          {faq.answer}
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{faq.category}</Badge>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                            <Button variant="ghost" size="sm">
                              Was this helpful?
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="py-8 text-center">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  {searchQuery ? (
                    <>
                      <h3 className="text-lg font-semibold">No results found</h3>
                      <p className="text-muted-foreground mt-2">
                        Try a different search term or contact support
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold">FAQs coming soon</h3>
                      <p className="text-muted-foreground mt-2">
                        Our FAQ section is currently being populated
                      </p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <p className="text-sm text-muted-foreground">
                Can't find what you're looking for?
              </p>
              <Button variant="outline" asChild>
                <a href="#support">
                  Contact Support
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Common topics quick links */}
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Content Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center">
                      <ChevronRight className="h-3 w-3 mr-1" />
                      How to import videos from Vimeo
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center">
                      <ChevronRight className="h-3 w-3 mr-1" />
                      Managing content categories
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center">
                      <ChevronRight className="h-3 w-3 mr-1" />
                      Setting up featured content
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center">
                      <ChevronRight className="h-3 w-3 mr-1" />
                      Adding and managing users
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center">
                      <ChevronRight className="h-3 w-3 mr-1" />
                      User roles and permissions
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center">
                      <ChevronRight className="h-3 w-3 mr-1" />
                      Managing premium subscriptions
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Technical Support</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center">
                      <ChevronRight className="h-3 w-3 mr-1" />
                      Troubleshooting video playback
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center">
                      <ChevronRight className="h-3 w-3 mr-1" />
                      API integration guide
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline flex items-center">
                      <ChevronRight className="h-3 w-3 mr-1" />
                      Payment gateway configuration
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Documentation Tab */}
        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>
                In-depth guides and reference materials for the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {searchQuery && filteredDocs && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    {filteredDocs.length} results found for "{searchQuery}"
                  </p>
                </div>
              )}
              
              {filteredDocs && filteredDocs.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredDocs.map((doc) => (
                      <Card key={doc.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{doc.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {doc.description}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-2 flex justify-between items-center">
                          <Badge variant="outline">{doc.category}</Badge>
                          <Button size="sm" variant="ghost" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View
                            </a>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  {searchQuery ? (
                    <>
                      <h3 className="text-lg font-semibold">No documentation found</h3>
                      <p className="text-muted-foreground mt-2">
                        Try a different search term or contact support
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold">Documentation coming soon</h3>
                      <p className="text-muted-foreground mt-2">
                        Our documentation section is currently being updated
                      </p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button className="ml-auto" asChild>
                <a href="/admin/documentation" target="_blank">
                  <Book className="mr-2 h-4 w-4" />
                  Open Full Documentation
                </a>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Video tutorials */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Video Tutorials</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <div className="aspect-video bg-muted w-full relative overflow-hidden rounded-t-lg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Getting Started Guide</CardTitle>
                  <CardDescription>
                    A complete overview of the admin dashboard
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Watch Tutorial
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <div className="aspect-video bg-muted w-full relative overflow-hidden rounded-t-lg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Content Management</CardTitle>
                  <CardDescription>
                    How to manage and organize your content
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Watch Tutorial
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <div className="aspect-video bg-muted w-full relative overflow-hidden rounded-t-lg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Vimeo Integration</CardTitle>
                  <CardDescription>
                    How to sync and manage videos from Vimeo
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Watch Tutorial
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
          
          {/* Resources */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Downloadable Resources</CardTitle>
              <CardDescription>
                Helpful guides and templates to get you started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      Admin User Manual
                    </TableCell>
                    <TableCell>Complete guide for administrators</TableCell>
                    <TableCell>PDF</TableCell>
                    <TableCell>2.4 MB</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Content Guidelines
                    </TableCell>
                    <TableCell>Best practices for content management</TableCell>
                    <TableCell>PDF</TableCell>
                    <TableCell>1.8 MB</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      API Documentation
                    </TableCell>
                    <TableCell>Technical guide for developers</TableCell>
                    <TableCell>PDF</TableCell>
                    <TableCell>3.2 MB</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contact Support Tab */}
        <TabsContent value="support" id="support">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Send us a message and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...supportForm}>
                  <form 
                    id="support-form" 
                    onSubmit={supportForm.handleSubmit(onSubmitSupportRequest)} 
                    className="space-y-4"
                  >
                    <FormField
                      control={supportForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter the subject of your inquiry" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={supportForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Where should we respond?" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={supportForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <div className="flex space-x-4">
                            <FormControl>
                              <div className="flex gap-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    className="form-radio"
                                    value="low"
                                    checked={field.value === 'low'}
                                    onChange={() => field.onChange('low')}
                                  />
                                  <span>Low</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    className="form-radio"
                                    value="medium"
                                    checked={field.value === 'medium'}
                                    onChange={() => field.onChange('medium')}
                                  />
                                  <span>Medium</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    className="form-radio"
                                    value="high"
                                    checked={field.value === 'high'}
                                    onChange={() => field.onChange('high')}
                                  />
                                  <span>High</span>
                                </label>
                              </div>
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={supportForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your issue or question in detail" 
                              className="min-h-[150px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Please include any relevant details such as error messages or steps to reproduce.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button 
                  form="support-form" 
                  type="submit" 
                  className="ml-auto"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </CardFooter>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Support Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    <strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM SAST
                  </p>
                  <p className="text-sm mt-1">
                    <strong>Saturday:</strong> 10:00 AM - 2:00 PM SAST
                  </p>
                  <p className="text-sm mt-1">
                    <strong>Sunday:</strong> Closed
                  </p>
                  <Separator className="my-4" />
                  <p className="text-sm">
                    <strong>Response Time:</strong> Within 24 hours on business days
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Email Support</h3>
                    <p className="text-sm mt-1">
                      <a href="mailto:support@madifa.co.za" className="text-primary">
                        support@madifa.co.za
                      </a>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Technical Support</h3>
                    <p className="text-sm mt-1">
                      <a href="mailto:tech@madifa.co.za" className="text-primary">
                        tech@madifa.co.za
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Other Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li>
                      <a href="#" className="text-primary hover:underline flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Status Page
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-primary hover:underline flex items-center text-sm">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Knowledge Base
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-primary hover:underline flex items-center text-sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Community Forums
                      </a>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}